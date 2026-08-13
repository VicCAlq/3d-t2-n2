const express = require('express')
const path = require('path')
const cors = require('cors');
const sql = require('sqlite3').verbose()
const { 
  porta,
  DB_NOME,
  TABELA_FONTES_NOME,
  TABELA_NOTICIAS_NOME
} = require('./env.js');
const { baixarFeedRSS } = require('./feedRSS.js');

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors());
app.use(express.static(path.join(__dirname, 'src')));

const db = new sql.Database(
  `./${DB_NOME}`,
  (erro) => {
    if (erro) {
      console.error(`Erro ao abrir o banco de dados "${DB_NOME}":`, erro.message);
    } else {
      console.log(`Conectado ao banco de dados SQLite3 "${DB_NOME}"`);
    }
  }
)

db.run(
  `CREATE TABLE IF NOT EXISTS ${TABELA_FONTES_NOME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_fonte TEXT NOT NULL,
    endereco TEXT NOT NULL
  )`,
  (erro) => {
    if (erro) {
      console.error(`Erro ao criar a tabela "${TABELA_FONTES_NOME}"`, erro.message);
    } else {
      console.log(`Tabela "${TABELA_FONTES_NOME}" pronta!`);
    }
  }
)

db.run(
  `CREATE TABLE IF NOT EXISTS ${TABELA_NOTICIAS_NOME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_noticia TEXT NOT NULL,
    fonte TEXT,
    endereco_noticia TEXT NOT NULL,
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL,
    dataDePublicação TEXT NOT NULL
  )`,
  (erro) => {
    if (erro) {
      console.error(`Erro ao criar a tabela "${TABELA_NOTICIAS_NOME}"`, erro.message);
    } else {
      console.log(`Tabela "${TABELA_NOTICIAS_NOME}" pronta!`);
    }
  }
)

app.get('/', (req, res) => {
  res.status(200).json({
    message: "Acesso permitido",
    data: [],
    ok: true,
  })
})


app.get('/api/noticias/categoria/:categoria', (req, res) => {
  const categoria = req.params.categoria
})

app.get('/api/fontes/cadastrar', async (req, res) => {

  if (typeof(req.query.link) !== 'string') {
    console.log("link em branco")
    return res.status(400).json({ error: 'Propriedade "link" não é uma string válida' });
  }

  try {
    new URL(req.query.link)
  } catch {
    console.log("link inválido")
    return res.status(400).json({ error: 'O texto enviado não se trata de um endereço Web' });
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
        ['nome_noticia', 'fonte', 'endereco_noticia', 'descricao', 'dataDePublicacao', 'categorias'],
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
      noticias: noticiasInseridas,
    })

  } catch (erro) {
    await executar('ROLLBACK')
    console.log(`erro na inserção: ${erro}`)
    res.status(500).json({ erro: erro.message })
  }
})

function executar(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (erro) {
      if (erro) { reject(erro) }
      else { resolve(this) } // { ultimoID, mudanças }
    })
  })
}

function buscar(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (erro, linhas) => {
      if (erro) { reject(erro) }
      else { resolve(linhas) }
    })
  })/
}

app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`)
})
