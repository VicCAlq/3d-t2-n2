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
    fonte TEXT,
    link TEXT,
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
    descricao TEXT,
    datadepublicacao INT,
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

app.get('/api/fontes/cadastrar', (req, res) => {
 
  if (!req.query) {
    res.status(400).json({ error: erro.message });
    return
  } else if (typeof(req.query.link) !== 'string') {
    res.status(400).json({ error: `Este "link" não foi encontrado` });
  } else {
    let url
    try {
      url = new URL(req.query.link)
    } catch(err) {
      res.status(400).json({ error: `O texto enviado não foi localizado` });
    }
  }

  const { nome, endereco } = req.query
})

db.run(
  `INSERT INTO ${TABELA_FONTES_NOME} (nome, endereco) VALUES (?, ?)`,
    [nome, endereco],
    (erro) => {
      if (erro) {
        res.status(400).json({ error: erro.message });
        return;
      } else {
        res.status(201).json({
          message: "Fonte cadastrada com sucesso",
          data: { nome, endereco },
        });
      }
    },
  );

app.get("/api/fontes/filtrarFontes", (req, res) => {
  db.all(
    `SELECT * FROM ${TABELA_FONTES_NOME} WHERE endereco = ?`,
    [req.query.endereco],
    (erro, fontes) => {
      if (erro) {
        res.status(400).json({ error: erro.message });
        return;
      } else {
        res.status(200).json({
          message: "fonte filtradas com sucesso",
          data: fontes,
        });
      }
    },
  );
});

app.get("/api/noticias/categoria/:categoria", (req, res) => {
  const categoria = req.params.categoria;
  db.all(
    `SELECT * FROM ${TABELA_NOTICIAS_NOME} WHERE categoria = ?`,
    [categoria],
    (erro, noticias) => {
      if (erro) {
        res.status(400).json({ error: erro.message });
      } else {
        res.status(200).json({
          message: "noticias filtradas com sucesso",
          data: noticias,
        });
      }
    },
  );
});

app.delete("/api/fontes/deletar/fonte/:id", (req, res) => {
  const id = req.params.id;
  db.run(
    `DELETE FROM ${TABELA_FONTES_NOME} WHERE id = ?`,
    [id],
    (erro) => {
      if (erro) {
        res.status(400).json({ error: erro.message });
      } else {
        res.status(200).json({
          message: "Fonte deletada",
        });
      }
    },
  );
});

app.delete("/api/noticias/deletar/noticia/:id", (req, res) => {
  const id = req.params.id;
  db.run(
    `DELETE FROM ${TABELA_NOTICIAS_NOME} WHERE id = ?`,
    [id],
    (erro) => {
      if (erro) {
        res.status(400).json({ error: erro.message });
      } else {
        res.status(200).json({
          message: "Notícia excluída",
        });
      }
    },
  );
});


export async function baixarFeedRSS(params) {
  
}

app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`)
})
