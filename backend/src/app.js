const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const { XMLParser } = require("fast-xml-parser");

const {
  DB_NOME,
  TABELA_FONTES_NOME,
  TABELA_NOTICIAS_NOME,
  PORTA,
} = require("./env");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database(`./${DB_NOME}`, (erro) => {
  if (erro) {
    console.log("deu erro no banco", erro.message);
  } else {
    console.log("conectou no banco");
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS ${TABELA_FONTES_NOME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL,
    url TEXT UNIQUE NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ativo INTEGER DEFAULT 1
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS ${TABELA_NOTICIAS_NOME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    description TEXT,
    data_publicacao TEXT,
    image TEXT,
    categoria TEXT,
    fk_fonte_id INTEGER,
    data_captura DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_fonte_id)
      REFERENCES ${TABELA_FONTES_NOME}(id)
      ON DELETE CASCADE
  )
`);

const parser = new XMLParser();

function extrairTituloDoLink(link) {
  if (!link) {
    return null;
  }

  const partes = link.split("/");

  let ultimaParte = partes[partes.length - 1];

  ultimaParte = ultimaParte
    .replace(".htm", "")
    .replace(".ghtm", "")
    .replace(".shtml", "");

  ultimaParte = ultimaParte.replace(/-/g, " ");

  return ultimaParte;
}

function validarURL(url) {
  return /^(https?:\/\/)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(
    url
  );
}

function insertFonte(nome, url) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO ${TABELA_FONTES_NOME} (nome, url) VALUES (?, ?)`,
      [nome, url],
      function (erro) {
        if (erro) {
          reject(erro);
          return;
        }

        resolve(this.lastID);
      }
    );
  });
}

function inserirUmaNoticia(dados) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT OR IGNORE INTO ${TABELA_NOTICIAS_NOME}
      (
        titulo,
        url,
        description,
        data_publicacao,
        image,
        fk_fonte_id,
        categoria
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, dados, function (erro) {
      if (erro) {
        reject(erro);
        return;
      }

      resolve({
        inserida: this.changes > 0,
      });
    });
  });
}

async function insertNoticias(noticias, fk_id) {
  const lista = Array.isArray(noticias)
    ? noticias
    : noticias
      ? [noticias]
      : [];

  let inseridas = 0;
  let ignoradas = 0;

  for (const noticia of lista) {
    if (!noticia) {
      continue;
    }

    let link = noticia.link;

    if (typeof link === "object") {
      link =
        link["@_href"] ||
        link.href ||
        link["#text"] ||
        "";
    }

    if (!link) {
      continue;
    }

    const conteudo =
      noticia["content:encoded"] || "";

    const imagem =
      typeof conteudo === "string"
        ? conteudo.match(/src="([^"]+)"/)?.[1] || null
        : null;

    const titulo =
      noticia.title ||
      noticia.description ||
      extrairTituloDoLink(link) ||
      "(sem título)";

    const descricao =
      noticia.description || titulo;

    let dataFormatada = null;

    const data = link.match(
      /\/(\d{4})\/(\d{2})\/(\d{2})\//
    );

    if (data) {
      const dataObj = new Date(
        Number(data[1]),
        Number(data[2]) - 1,
        Number(data[3])
      );

      dataFormatada =
        dataObj.toLocaleDateString("pt-BR");
    }

    const pubDate =
      noticia.pubDate ||
      noticia.published ||
      noticia.updated ||
      dataFormatada;

    const partes = link.split("/");

    const categoria =
      partes.length > 3
        ? partes[3]
        : null;

    const resultado = await inserirUmaNoticia([
      titulo,
      link,
      descricao,
      pubDate,
      imagem,
      fk_id,
      categoria,
    ]);

    if (resultado.inserida) {
      inseridas++;
    } else {
      ignoradas++;
    }
  }

  return {
    total: lista.length,
    inseridas,
    ignoradas,
  };
}

function queryBuilder(params) {
  const conditions = [];
  const values = [];

  if (params.fonte) {
    conditions.push("fk_fonte_id = ?");
    values.push(params.fonte);
  }

  if (params.categoria) {
    conditions.push("categoria = ?");
    values.push(params.categoria);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const query = `
    SELECT *
    FROM ${TABELA_NOTICIAS_NOME}
    ${whereClause}
    ORDER BY data_publicacao DESC
  `.trim();

  return {
    query,
    values,
  };
}

async function getNoticias(params) {
  const { query, values } =
    queryBuilder(params);

  return new Promise((resolve, reject) => {
    db.all(
      query,
      values,
      (erro, rows) => {
        if (erro) {
          reject(erro);
          return;
        }

        resolve(rows);
      }
    );
  });
}

async function processarRSS(url, nome) {
  if (!validarURL(url)) {
    throw new Error("URL inválida");
  }

  const fonteExistente =
    await new Promise((resolve, reject) => {
      db.get(
        `SELECT id FROM ${TABELA_FONTES_NOME} WHERE url = ?`,
        [url],
        (erro, row) => {
          if (erro) {
            reject(erro);
            return;
          }

          resolve(row);
        }
      );
    });

  let fonteId;

  if (fonteExistente) {
    fonteId = fonteExistente.id;
  } else {
    try {
      fonteId = await insertFonte(
        nome,
        url
      );
    } catch (erro) {
      if (
        erro.message.includes("UNIQUE")
      ) {
        const fonte =
          await new Promise(
            (resolve, reject) => {
              db.get(
                `SELECT id FROM ${TABELA_FONTES_NOME} WHERE url = ?`,
                [url],
                (err, row) => {
                  if (err) {
                    reject(err);
                    return;
                  }

                  resolve(row);
                }
              );
            }
          );

        if (!fonte) {
          throw erro;
        }

        fonteId = fonte.id;
      } else {
        throw erro;
      }
    }
  }

  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new Error(
      `Erro ao acessar RSS: HTTP ${resposta.status}`
    );
  }

  const texto = await resposta.text();

  const json = parser.parse(texto);

  let items = [];

  if (
    json.rss &&
    json.rss.channel &&
    json.rss.channel.item
  ) {
    items = json.rss.channel.item;
  } else if (
    json.feed &&
    json.feed.entry
  ) {
    items = json.feed.entry;
  } else if (json.items) {
    items = json.items;
  }

  const resultado =
    await insertNoticias(
      items,
      fonteId
    );

  return {
    fonte_id: fonteId,
    processados: resultado.total,
    inseridas: resultado.inseridas,
    ignoradas: resultado.ignoradas,
  };
}

app.get("/fontes", (req, res) => {
  db.all(
    `
      SELECT
        id,
        nome,
        url,
        data_cadastro,
        ativo
      FROM ${TABELA_FONTES_NOME}
      WHERE ativo = 1
      ORDER BY nome
    `,
    [],
    (erro, rows) => {
      if (erro) {
        console.log(erro);

        return res
          .status(500)
          .send("deu erro");
      }

      res.json({
        success: true,
        total: rows.length,
        data: rows,
      });
    }
  );
});

app.get("/fontes/:id", (req, res) => {
  db.get(
    `
      SELECT *
      FROM ${TABELA_FONTES_NOME}
      WHERE id = ?
    `,
    [req.params.id],
    (erro, row) => {
      if (erro) {
        return res
          .status(500)
          .send("deu erro");
      }

      if (!row) {
        return res
          .status(404)
          .send("nao achei essa fonte");
      }

      res.json({
        success: true,
        data: row,
      });
    }
  );
});

app.post("/fontes", async (req, res) => {
  const nome = req.body.nome;
  const url = req.body.url;

  if (!nome || !url) {
    return res.status(400).json({
      success: false,
      error: "Nome e URL são obrigatórios",
    });
  }

  try {
    const id =
      await insertFonte(nome, url);

    res.status(201).json({
      success: true,
      message:
        "Fonte cadastrada com sucesso",
      data: {
        id,
        nome,
        url,
      },
    });
  } catch (erro) {
    if (
      erro.message.includes("UNIQUE")
    ) {
      return res.status(409).json({
        success: false,
        error:
          "Esta fonte já está cadastrada",
      });
    }

    console.log(erro);

    res.status(500).json({
      success: false,
      error: erro.message,
    });
  }
});

app.post(
  "/fontes/processar",
  async (req, res) => {
    const nome = req.body.nome;
    const url = req.body.url;

    if (!nome || !url) {
      return res.status(400).json({
        success: false,
        error:
          "Nome e URL são obrigatórios",
      });
    }

    try {
      const resultado =
        await processarRSS(
          url,
          nome
        );

      res.status(201).json({
        success: true,
        message:
          "Fonte processada com sucesso",
        data: resultado,
      });
    } catch (erro) {
      console.log(erro);

      res.status(400).json({
        success: false,
        error: erro.message,
      });
    }
  }
);

app.delete(
  "/fontes/:id",
  (req, res) => {
    db.run(
      `
        DELETE FROM ${TABELA_FONTES_NOME}
        WHERE id = ?
      `,
      [req.params.id],
      function (erro) {
        if (erro) {
          return res
            .status(500)
            .send("deu erro");
        }

        res.json({
          success: true,
          message: `Fonte ${req.params.id} removida`,
        });
      }
    );
  }
);

app.get(
  "/noticias",
  async (req, res) => {
    const categoria =
      req.query.categoria;

    const fonte =
      req.query.fonte;

    try {
      const noticias =
        await getNoticias({
          categoria,
          fonte,
        });

      res.json({
        success: true,
        total: noticias.length,
        data: noticias,
      });
    } catch (erro) {
      console.log(erro);

      res
        .status(500)
        .send(
          "erro ao buscar noticias"
        );
    }
  }
);

app.get(
  "/noticias/categorias",
  (req, res) => {
    db.all(
      `
        SELECT DISTINCT categoria
        FROM ${TABELA_NOTICIAS_NOME}
        WHERE categoria IS NOT NULL
        ORDER BY categoria
      `,
      [],
      (erro, rows) => {
        if (erro) {
          return res
            .status(500)
            .send("deu erro");
        }

        const categorias =
          rows.map(
            (row) => row.categoria
          );

        res.json({
          success: true,
          total: categorias.length,
          data: categorias,
        });
      }
    );
  }
);

app.get(
  "/noticias/:id",
  (req, res) => {
    db.get(
      `
        SELECT
          a.*,
          s.nome AS fonte_nome
        FROM ${TABELA_NOTICIAS_NOME} a
        LEFT JOIN ${TABELA_FONTES_NOME} s
          ON a.fk_fonte_id = s.id
        WHERE a.id = ?
      `,
      [req.params.id],
      (erro, row) => {
        if (erro) {
          return res
            .status(500)
            .send("deu erro");
        }

        if (!row) {
          return res
            .status(404)
            .send(
              "nao achei essa noticia"
            );
        }

        res.json({
          success: true,
          data: row,
        });
      }
    );
  }
);

app.post(
  "/rss/importar",
  async (req, res) => {
    const url = req.body.url;
    const nome =
      req.body.nome ||
      "Fonte Importada";

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL é obrigatória",
      });
    }

    try {
      const resultado =
        await processarRSS(
          url,
          nome
        );

      res.json({
        success: true,
        message:
          "RSS importado com sucesso",
        data: resultado,
      });
    } catch (erro) {
      console.log(erro);

      res.status(400).json({
        success: false,
        error: erro.message,
      });
    }
  }
);

app.listen(PORTA, () => {
  console.log(
    "rodando na porta " + PORTA
  );
});

module.exports = app;