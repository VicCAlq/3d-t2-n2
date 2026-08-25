const express = require('express')
const path = require('path')
const cors = require('cors');
const sql = require('sqlite3').verbose()
const fontesRoutes = require('./routes/fontes');
const noticiasRoutes = require('./routes/noticias');
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
    name VARCHAR(50) UNIQUE,
    url TEXT UNIQUE,
    id INTEGER PRIMARY KEY AUTOINCREMENT
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
    titulo TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT NOT NULL,
    data_publicacao TEXT,
    image TEXT,
    categoria TEXT,
    fk_fonte_id INTEGER REFERENCES ${TABELA_FONTES_NOME}(id),
    id INTEGER PRIMARY KEY AUTOINCREMENT
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

app.get('/api/fontes/cadastrar', (req, res) => {
  if (!req.query) {
    res.status(400).json({ error: erro.message });
    return
  }

  const { nome, endereco } = req.query
})

app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`)
})

app.use("/fontes", fontesRoutes)
app.use("/noticias", noticiasRoutes)

