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
    nome TEXT,
    endereco TEXT
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
    link TEXT,
    categoria TEXT,
    data_publicacao TEXT,
    fonte_id INTEGER,
    FOREIGN KEY (fonte_id) REFERENCES ${TABELA_FONTES_NOME}(id)
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

app.get('/api/fontes/cadastrar', (req, res) => {
  const { nome, endereco } = req.query

  if (!nome || !endereco) {
    return res.status(400).json({ error: 'nome e endereco são obrigatórios' })
  }

  db.run(
    `INSERT INTO ${TABELA_FONTES_NOME} (nome, endereco) VALUES (?, ?)`,
    [nome, endereco],
    function (erro) {
      if (erro) {
        return res.status(500).json({ error: erro.message })
      }
      res.status(201).json({ id: this.lastID, nome, endereco })
    
    }
  )
})

app.get('/api/noticias/categoria/:categoria', (req, res) => {
  const categoria = req.params.categoria

  db.all(
    `SELECT * FROM ${TABELA_NOTICIAS_NOME} WHERE categoria = ?`,
    [categoria],
    (erro, linhas) => {
      if (erro) {
        return res.status(500).json({ error: erro.message })
      }
      res.status(200).json(linhas)
    }
  )
})


app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`)
})
