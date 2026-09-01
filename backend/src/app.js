const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const {
  porta,
  DB_NOME,
  TABELA_FONTES_NOME,
  TABELA_NOTICIAS_NOME
} = require("./env.js");

const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(
  `./${DB_NOME}`,
  (erro) => {

    if (erro) {
      console.log(
        "Erro ao conectar ao banco:",
        erro.message
      );
    } else {
      console.log(
        `Banco "${DB_NOME}" conectado!`
      );
    }

  }
);

db.run(`
  CREATE TABLE IF NOT EXISTS ${TABELA_FONTES_NOME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    endereco TEXT NOT NULL
  )
`, (erro) => {

  if (erro) {
    console.log(
      "Erro ao criar tabela fontes:",
      erro.message
    );
  } else {
    console.log("Tabela fontes pronta!");
  }

});

db.run(`
  CREATE TABLE IF NOT EXISTS ${TABELA_NOTICIAS_NOME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT NOT NULL,
    fonte_id INTEGER NOT NULL
  )
`, (erro) => {

  if (erro) {
    console.log(
      "Erro ao criar tabela noticias:",
      erro.message
    );
  } else {
    console.log("Tabela noticias pronta!");
  }

});

app.get("/", (req, res) => {

  res.json({
    mensagem: "Servidor LoL News funcionando!"
  });

});

app.get("/api/fontes", (req, res) => {

  db.all(
    `SELECT * FROM ${TABELA_FONTES_NOME} ORDER BY id DESC`,
    [],
    (erro, fontes) => {

      if (erro) {
        return res.status(500).json({
          error: "Erro ao buscar fontes"
        });
      }

      res.json(fontes);

    }
  );

});

app.post("/api/fontes", (req, res) => {

  const { nome, endereco } = req.body;

  if (!nome || !endereco) {

    return res.status(400).json({
      error: "Nome e endereço são obrigatórios"
    });

  }

  db.run(
    `
      INSERT INTO ${TABELA_FONTES_NOME}
      (nome, endereco)
      VALUES (?, ?)
    `,
    [nome, endereco],
    function (erro) {

      if (erro) {

        return res.status(500).json({
          error: "Erro ao cadastrar fonte"
        });

      }

      res.status(201).json({
        mensagem: "Fonte cadastrada!",
        fonte: {
          id: this.lastID,
          nome,
          endereco
        }
      });

    }
  );

});

app.delete(
  "/api/fontes/:id",
  (req, res) => {

    const id = req.params.id;

    db.run(
      `
        DELETE FROM ${TABELA_FONTES_NOME}
        WHERE id = ?
      `,
      [id],
      function (erro) {

        if (erro) {

          return res.status(500).json({
            error: "Erro ao apagar fonte"
          });

        }

        if (this.changes === 0) {

          return res.status(404).json({
            error: "Fonte não encontrada"
          });

        }

        res.json({
          mensagem: "Fonte apagada!"
        });

      }
    );

  }
);

app.get("/api/noticias", (req, res) => {

  const consulta = `
    SELECT
      noticias.id,
      noticias.titulo,
      noticias.descricao,
      noticias.categoria,
      noticias.fonte_id,
      fontes.nome AS fonte
    FROM noticias
    INNER JOIN fontes
      ON noticias.fonte_id = fontes.id
    ORDER BY noticias.id DESC
  `;

  db.all(
    consulta,
    [],
    (erro, noticias) => {

      if (erro) {

        return res.status(500).json({
          error: "Erro ao buscar notícias"
        });

      }

      res.json(noticias);

    }
  );

});

app.post("/api/noticias", (req, res) => {

  const {
    titulo,
    descricao,
    categoria,
    fonte_id
  } = req.body;

  if (!titulo || !categoria || !fonte_id) {

    return res.status(400).json({
      error:
        "Título, categoria e fonte são obrigatórios"
    });

  }

  db.run(
    `
      INSERT INTO ${TABELA_NOTICIAS_NOME}
      (titulo, descricao, categoria, fonte_id)
      VALUES (?, ?, ?, ?)
    `,
    [
      titulo,
      descricao || "",
      categoria,
      fonte_id
    ],
    function (erro) {

      if (erro) {

        return res.status(500).json({
          error: "Erro ao cadastrar notícia"
        });

      }

      res.status(201).json({
        mensagem: "Notícia cadastrada!",
        noticia: {
          id: this.lastID,
          titulo,
          descricao,
          categoria,
          fonte_id
        }
      });

    }
  );

});

app.get(
  "/api/noticias/categoria/:categoria",
  (req, res) => {

    const categoria = req.params.categoria;

    const consulta = `
      SELECT
        noticias.id,
        noticias.titulo,
        noticias.descricao,
        noticias.categoria,
        noticias.fonte_id,
        fontes.nome AS fonte
      FROM noticias
      INNER JOIN fontes
        ON noticias.fonte_id = fontes.id
      WHERE noticias.categoria = ?
      ORDER BY noticias.id DESC
    `;

    db.all(
      consulta,
      [categoria],
      (erro, noticias) => {

        if (erro) {

          return res.status(500).json({
            error: "Erro ao filtrar notícias"
          });

        }

        res.json(noticias);

      }
    );

  }
);

app.delete(
  "/api/noticias/:id",
  (req, res) => {

    const id = req.params.id;

    db.run(
      `
        DELETE FROM ${TABELA_NOTICIAS_NOME}
        WHERE id = ?
      `,
      [id],
      function (erro) {

        if (erro) {

          return res.status(500).json({
            error: "Erro ao apagar notícia"
          });

        }

        if (this.changes === 0) {

          return res.status(404).json({
            error: "Notícia não encontrada"
          });

        }

        res.json({
          mensagem: "Notícia apagada!"
        });

      }
    );

  }
);

app.listen(porta, () => {

  console.log(
    `Servidor rodando em http://localhost:${porta}`
  );

});
