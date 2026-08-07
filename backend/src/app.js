const express = require('express')
const path = require('path')
const cors = require('cors');
const sql = require('sqlite3').verbose()
const { 
  porta,
  DB_NOME,
  TABELA_FONTES_NOME,
  TABELA_NOTICIAS_NOME
} = require('./env.js')
const { baixarFeedRSS } = require('./leitorRss.js')

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
    titulo TEXT,
    link TEXT UNIQUE,
    descricao TEXT
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
    titulo TEXT,
    link TEXT UNIQUE,
    descricao TEXT,
    dataDePublicacao TEXT,
    categorias TEXT
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

  if (!req.query) {
    res.status(400).json({ error: erro.message });
    return
  } else if (typeof(req.query.link) !== 'string') {
    res.status(400).json({ error: `Propriedade "link" não é uma string válida` });
  } else {
    let url
    try {
      url = new URL(req.query.link)
    } catch(err) {
      res.status(400).json({ error: `O texto enviado não se trata de um endereço Web` });
    }
  }

  const { link } = req.query

  await baixarFeedRSS(link)
  .then(res => {
    const fonteNoticia = [
      res.fonte.titulo, 
      res.fonte.link, 
      res.fonte.descricao
    ]
    const noticias = res.noticias

    db.run()

    noticias.map(noticia => {
      db.run(``, [] )
    })
  })
})



app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`)
})
