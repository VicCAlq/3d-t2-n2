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
    fonte TEXT,
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
      ['nome', 'link', 'descricao'],
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
      noticias: noticiasInseridas,
    })

  } catch (erro) {
    await executar('ROLLBACK')
    console.log(`erro na inserção: ${erro}`)
    res.status(500).json({ erro: erro.message })
  }
})

app.get("/api/fontes/filtrarFontes", (req, res) => {
  db.all(
    `SELECT * FROM ${TABELA_NOTICIAS_NOME} WHERE link = ?`,
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
app.get('/api/noticias/categoria/:categoria', async (req, res) => {
  const categoria = req.params.categoria
  try {
    const linhas = await buscar(
      `SELECT * FROM ${TABELA_NOTICIAS_NOME} WHERE ',' || categorias || ',' LIKE '%,' || ? || ',%'`,
      [categoria]
    )
    res.json({ noticias: linhas })
  } catch (erro) {
    res.status(500).json({ erro: erro.message })
  }
})

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

app.get('/api/fontes/', async (req, res) => {
  try {
    const fontes = await buscar(`SELECT * FROM ${TABELA_FONTES_NOME}`)
    res.json({ fontes })
  } catch (erro) {
    res.status(500).json({ erro: erro.message })
  }
})

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

app.get("/api/categorias/:categoria", (req, res) => {
  const categoria = req.params.categoria;

  db.all(
    `SELECT * FROM categorias WHERE nome = ?`,
    [categoria],
    (erro, categorias) => {
      if (erro) {
        res.status(400).json({
          error: erro.message,
        });
      } else {
        res.status(200).json({
          message: "categorias filtradas com sucesso",
          data: categorias,
        });
      }
    }
  );
});

app.delete("/api/categorias/:id", (req, res) => {
  const id = req.params.id;

  db.run(
    `DELETE FROM categorias WHERE id = ?`,
    [id],
    function (erro) {
      if (erro) {
        res.status(400).json({
          error: erro.message,
        });
      } else {
        res.status(200).json({
          message: "categoria deletada com sucesso",
          data: {
            id: id,
            alteracoes: this.changes,
          },
        });
      }
    }
  );
});

app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`)
})
