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
const { baixarFeedRSS } = require('./leitorRSS.js');

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
    titulo TEXT NOT NULL,
    link TEXT NOT NULL,
    descricao TEXT
  )`,
  (erro) => {
    if (erro) {
      console.error(`Erro ao criar a tabela "${TABELA_FONTES_NOME}"`, erro.message);
    } else {
      console.log(`Tabela "${TABELA_FONTES_NOME}" pronta!`);
    }
  }
);


db.run(
  `CREATE TABLE IF NOT EXISTS ${TABELA_NOTICIAS_NOME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_noticia TEXT NOT NULL,
    fonte TEXT,
    endereco_noticia TEXT NOT NULL,
    descricao TEXT NOT NULL,
    categorias TEXT NOT NULL,
    dataDePublicacao TEXT NOT NULL
  )`,
  (erro) => {
    if (erro) {
      console.error(`Erro ao criar a tabela "${TABELA_NOTICIAS_NOME}"`, erro.message);
    } else {
      console.log(`Tabela "${TABELA_NOTICIAS_NOME}" pronta!`);
    }
  }
);

function normalizarCategoria(categoriaCrua) {

  if (!categoriaCrua) {
    return 'Geral'
  }

  const texto = categoriaCrua.toLowerCase()

  if (texto.includes('polít') || texto.includes('polit') || texto.includes('govern') || texto.includes('eleiç')) {
    return 'Política'
  }
  if (texto.includes('econ') || texto.includes('mercado') || texto.includes('negóci') || texto.includes('finan')) {
    return 'Economia'
  }
  if (texto.includes('esport') || texto.includes('futebol') || texto.includes('copa') || texto.includes('olimp')) {
    return 'Esportes'
  }
  if (texto.includes('tecn') || texto.includes('tech') || texto.includes('digital') || texto.includes('internet')) {
    return 'Tecnologia'
  }
  if (texto.includes('ciên') || texto.includes('cienc') || texto.includes('espaço') || texto.includes('espac')) {
    return 'Ciência'
  }
  if (texto.includes('saúd') || texto.includes('saud') || texto.includes('medicina') || texto.includes('vacina')) {
    return 'Saúde'
  }
  if (texto.includes('cultur') || texto.includes('arte') || texto.includes('cinema') || texto.includes('música') || texto.includes('musica')) {
    return 'Cultura'
  }
  if (texto.includes('mundo') || texto.includes('internacional') || texto.includes('exterior') || texto.includes('global')) {
    return 'Mundo'
  }

  return 'Geral'
}


app.get('/', (req, res) => {
  res.status(200).json({
    message: "Acesso permitido",
    data: [],
    ok: true,
  })
})

app.get('/api/noticias/categoria/:categoria', async (req, res) => {
  const categoria = req.params.categoria
  try {
    const linhas = await buscar(
      `SELECT * FROM ${TABELA_NOTICIAS_NOME} WHERE ',' || categorias || ',' LIKE '%,' || ? || ',%'`,
      [categoria]
    )
    res.json(linhas)
  } catch (erro) {
    res.status(500).json({ erro: erro.message })
  }
})

//filtra a tabela de notícias pela fonte
app.get('/api/noticias/fonte/:fonte', async (req, res) => {
  const fonte = req.params.fonte

  try {
    const linhas = await buscar(
      `SELECT * FROM ${TABELA_NOTICIAS_NOME} WHERE fonte = ?`,
      [fonte]
    )

    res.json(linhas)

  } catch (erro) {
    res.status(500).json({ erro: erro.message })
  }
})

//vai enviar a lista de fontes de notícias
app.get('/api/fontes/', async (req, res) => {
  try {
    const fontes = await buscar(`SELECT * FROM ${TABELA_FONTES_NOME}`)
    res.json({ fontes })
  } catch (erro) {
    res.status(500).json({ erro: erro.message })
  }
})

//envia lista de categorias de notícias
app.get('/api/categorias/', async (req, res) => {
  try {
    const linhas = await buscar(
      `SELECT DISTINCT categorias FROM ${TABELA_NOTICIAS_NOME} WHERE categorias IS NOT NULL AND categorias != ''`
    )
    const categorias = [...new Set(
      linhas
        .flatMap(l => String(l.categorias).split(','))
        .map(c => c.trim())
        .filter(Boolean)
    )]
    res.json({ categorias })
  } catch (erro) {
    res.status(500).json({ erro: erro.message })
  }
})

app.delete('/api/noticias/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'Id inválido' })
  }
  try {
    const resultado = await executar(
      `DELETE FROM ${TABELA_NOTICIAS_NOME} WHERE id = ?`,
      [id]
    )
    if (resultado.changes === 0) {
      return res.status(404).json({ erro: 'Notícia não encontrada' })
    }
    res.json({ mensagem: 'Notícia apagada com sucesso', apagado: resultado.changes })
  } catch (erro) {
    res.status(500).json({ erro: erro.message })
  }
})

app.delete('/api/fontes/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'Id inválido' })
  }
  try {
    const [fonte] = await buscar(
      `SELECT * FROM ${TABELA_FONTES_NOME} WHERE id = ?`,
      [id]
    )
    if (!fonte) {
      return res.status(404).json({ erro: 'Fonte não encontrada' })
    }

    await executar(
      `DELETE FROM ${TABELA_NOTICIAS_NOME} WHERE id = ?`,
      [fonte.titulo]
    )

    const resultado = await executar(
      `DELETE FROM ${TABELA_FONTES_NOME} WHERE id = ?`,
      [id]
    )

    res.json({
      mensagem: 'Fonte e notícias apagadas com sucesso',
      apagado: resultado.changes
    })

  } catch (erro) {
    res.status(500).json({ erro: erro.message })
  }
})

app.get('/api/fontes/cadastrar', async (req, res) => {

  if (typeof (req.query.link) !== 'string') {
    console.log("link em branco")
    return res.status(400).json({ error: 'Propriedade "link" não é uma string válida' });
  }

  try {
    new URL(req.query.link)
  } catch {
    console.log("link inválido")
    return res.status(400).json({ error: 'O texto enviado não se trata de um endereço Web' });
  }

  const categoriaFonte = typeof(req.query.categoria) === 'string' ? req.query.categoria : null

  async function inserirOuBuscarPorLink(tabela, colunas, valores) {
    const indiceLink = colunas.indexOf('link')
    if (String(valores[indiceLink] || '').trim() === '') {
      valores[indiceLink] = null
    }
    let colunaChave = 'link'
    let chave = valores[indiceLink]
    if (chave === null) {
      const indiceTitulo = colunas.indexOf('nome_noticia')
      colunaChave = 'nome_noticia'
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

     const categoriasCruas = noticia.categorias?.toString() || ''
     const primeiraCategoria = categoriasCruas.split(',')[0]?.trim() || ''
     const categoriaNormalizada = normalizarCategoria(primeiraCategoria)
 

      const linha = await inserirOuBuscarPorLink(
        TABELA_NOTICIAS_NOME,
        ['nome_noticia', 'fonte', 'endereco_noticia', 'descricao', 'dataDePublicacao', 'categorias'],
        [
          noticia.titulo,
          feed.fonte.titulo,
          noticia.link,
          noticia.descricao,
          noticia.dataPublicacao,
          categoriaNormalizada
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
      else { resolve(this) }
    })
  })
}

function buscar(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (erro, linhas) => {
      if (erro) { reject(erro) }
      else { resolve(linhas) }
    })
  })
}

app.get('/api/noticias', async (req, res) => {
  try {
    const noticias = await buscar(
      `SELECT * FROM ${TABELA_NOTICIAS_NOME}`
    );

    res.json(noticias);

  } catch (erro) {
    console.error("Erro ao buscar notícias:", erro);

    res.status(500).json({
      erro: erro.message
    });
  }
});


app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`)
})
