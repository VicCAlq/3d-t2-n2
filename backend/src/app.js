const express = require('express')
const path = require('path')
const cors = require('cors')
const sql = require('sqlite3').verbose()
const RSSParser = require('rss-parser') 
const {
  porta,
  DB_NOME,
  TABELA_FONTES_NOME,
  TABELA_NOTICIAS_NOME
} = require('./env.js')

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, 'src')))

const db = new sql.Database(
  `./${DB_NOME}`,
  (erro) => {
    if (erro) {
      console.error(`Erro ao abrir o banco de dados "${DB_NOME}":`, erro.message)
    } else {
      console.log(`Conectado ao banco de dados SQLite3 "${DB_NOME}"`)
    }
  }
)



db.run(
  `CREATE TABLE IF NOT EXISTS ${TABELA_FONTES_NOME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT,
    link TEXT UNIQUE,
    descricao TEXT
  )`,
  (erro) => {
    if (erro) {
      console.error(`Erro ao criar a tabela "${TABELA_FONTES_NOME}"`, erro.message)
    } else {
      console.log(`Tabela "${TABELA_FONTES_NOME}" pronta!`)
    }
  }
)

db.run(
  `CREATE TABLE IF NOT EXISTS ${TABELA_NOTICIAS_NOME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT,
    fonte TEXT,
    link TEXT UNIQUE,
    descricao TEXT,
    dataDePublicacao TEXT,
    categorias TEXT
  )`,
  (erro) => {
    if (erro) {
      console.error(`Erro ao criar a tabela "${TABELA_NOTICIAS_NOME}"`, erro.message)
    } else {
      console.log(`Tabela "${TABELA_NOTICIAS_NOME}" pronta!`)
    }
  }
)

function executar(sqlTexto, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sqlTexto, params, function (erro) {
      if (erro) { reject(erro) }
      else { resolve(this) }
    })
  })
}

function buscar(sqlTexto, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sqlTexto, params, (erro, linhas) => {
      if (erro) { reject(erro) }
      else { resolve(linhas) }
    })
  })
}


const rssParser = new RSSParser()

async function baixarFeedRSS(link) {
  const feedBruto = await rssParser.parseURL(link)

  return {
    fonte: {
      titulo: feedBruto.title || link,
      link: feedBruto.link || link,
      descricao: feedBruto.description || ''
    },
    noticias: feedBruto.items.map((item) => ({
      titulo: item.title,
      link: item.link,
      descricao: item.contentSnippet || item.content || '',
      dataPublicacao: item.pubDate || '',
      categorias: item.categories || []
    }))
  }
}


app.get('/api/fontes/cadastrar', async (req, res) => {
  if (typeof (req.query.link) !== 'string') {
    return res.status(400).json({ error: 'Propriedade "link" não é uma string válida' })
  }

  try {
    new URL(req.query.link)
  } catch {
    return res.status(400).json({ error: 'O texto enviado não se trata de um endereço Web' })
  }

  async function inserirOuBuscarPorLink(tabela, colunas, valores) {
    const indiceLink = colunas.indexOf('link')
    if (String(valores[indiceLink] || '').trim() === '') {
      valores[indiceLink] = null
    }
    let colunaChave = 'link'
    let chave = valores[indiceLink]
    if (chave === null) {
      const indiceTitulo = colunas.indexOf('titulo')
      colunaChave = 'titulo'
      chave = valores[indiceTitulo]
    }

    await executar(
      `INSERT OR IGNORE INTO ${tabela} (${colunas.join(', ')}) VALUES (${colunas.map(() => '?').join(', ')})`,
      valores
    )

    const [linha] = await buscar(`SELECT * FROM ${tabela} WHERE ${colunaChave} = ?`, [chave])
    return linha
  }

  try {
    await executar('BEGIN TRANSACTION')

    const feed = await baixarFeedRSS(req.query.link)

    const fonte = await inserirOuBuscarPorLink(
      TABELA_FONTES_NOME,
      ['titulo', 'link', 'descricao'],
      [feed.fonte.titulo, feed.fonte.link, feed.fonte.descricao]
    )

    const noticiasInseridas = []
    for (const noticia of feed.noticias) {
      const linha = await inserirOuBuscarPorLink(
        TABELA_NOTICIAS_NOME,
        ['titulo', 'fonte', 'link', 'descricao', 'dataDePublicacao', 'categorias'],
        [
          noticia.titulo,
          feed.fonte.titulo,
          noticia.link,
          noticia.descricao,
          noticia.dataPublicacao,
          noticia.categorias?.toString() || ''
        ]
      )
      if (linha) { noticiasInseridas.push(linha) }
    }

    await executar('COMMIT')

    res.json({
      mensagem: 'Feed XML inserido com sucesso.',
      fontes: fonte ? [fonte] : [],
      noticias: noticiasInseridas
    })
  } catch (erro) {
    await executar('ROLLBACK')
    console.log(`erro na inserção: ${erro}`)
    res.status(500).json({ erro: erro.message })
  }
})


app.get('/api/noticias/fonte/:fonte', (req, res) => {
  const fonte = req.params.fonte
  db.all(
    `SELECT * FROM ${TABELA_NOTICIAS_NOME} WHERE fonte LIKE ?`,
    [`%${fonte}%`],
    (erro, linhas) => {
      if (erro) {
        res.status(500).json({ error: erro.message })
        return
      }
      res.json(linhas)
    }
  )
})

 
app.get('/api/noticias/categoria/:categoria', (req, res) => {
  const categoria = req.params.categoria
  db.all(
    `SELECT * FROM ${TABELA_NOTICIAS_NOME} WHERE categorias LIKE ?`,
    [`%${categoria}%`],
    (erro, linhas) => {
      if (erro) {
        res.status(500).json({ error: erro.message })
        return
      }
      res.json(linhas)
    }
  )
})

app.get('/api/fontes', (req, res) => {
  db.all(`SELECT * FROM ${TABELA_FONTES_NOME}`, [], (erro, linhas) => {
    if (erro) {
      res.status(500).json({ error: erro.message })
      return
    }
    res.json(linhas)
  })
})

app.delete('/api/fontes/:id', (req, res) => {
  const { id } = req.params

  db.run(
    `DELETE FROM ${TABELA_FONTES_NOME} WHERE id = ?`,
    [id],
    function (erro) {
      if (erro) {
        res.status(400).json({ error: erro.message })
        return
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Fonte não encontrada' })
        return
      }
      res.json({ message: 'Fonte removida.', id: Number(id) })
    }
  )
})
app.delete('/api/noticias/:id', (req, res) => {
  const { id } = req.params

  db.run(
    `DELETE FROM ${TABELA_NOTICIAS_NOME} WHERE id = ?`,
    [id],
    function (erro) {
      if (erro) {
        res.status(400).json({ error: erro.message })
        return
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Notícia não encontrada' })
        return
      }
      res.json({ message: 'Notícia removida.', id: Number(id) })
    }
  )
})
app.get('/api/noticias', (req, res) => {
  db.all(`SELECT * FROM ${TABELA_NOTICIAS_NOME}`, [], (erro, linhas) => {
    if (erro) {
      res.status(500).json({ error: erro.message })
      return
    }
    res.json(linhas)
  })
})
app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`)
})
