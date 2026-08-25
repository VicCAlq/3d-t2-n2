const db = require('./db_index.js')

const {
  TABELA_NOTICIAS_NOME
} = require('../env.js')

function extrairTituloDoLink(link) {
  if (!link) return null;
  const partes = link.split("/");
  let ultimaParte = partes[partes.length - 1];
  ultimaParte = ultimaParte.replace(".htm", "").replace(".ghtm", "").replace(".shtml", "");
  ultimaParte = ultimaParte.replace(/-/g, " ");
  return ultimaParte;
}


async function insert_all_into_noticias(noticias, fk_id) {
    const lista = Array.isArray(noticias) ? noticias : [noticias];

    const stmt = db.prepare(`
        INSERT INTO ${TABELA_NOTICIAS_NOME}
        (titulo, url, description, data_publicacao, image, fk_fonte_id, categoria)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const noticia of lista) {
        const conteudo = noticia["content:encoded"] || "";
        const imagem = conteudo.match(/src="([^"]+)"/)?.[1] || null;

        const titulo = noticia.title || noticia.description || extrairTituloDoLink(noticia.link) || "(sem título)";
        const descricao = noticia.description || titulo;

        const data = noticia.link.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
        const dataFormatada = data
            ? new Date(data[1], data[2] - 1, data[3]).toLocaleDateString("pt-BR")
            : null;

        const pubDate = noticia.pubDate || dataFormatada;
        const categoria = noticia.link.split("/")[3];

        stmt.run([
            titulo,
            noticia.link,
            descricao,
            pubDate,
            imagem,
            fk_id,
            categoria
        ]);
    }

    stmt.finalize();

    return {
        success: true,
        total: lista.length
    };
}

function queryBuilder(params) {
  const conditions = [];
  const values = [];

  if (params.fonte) {
    conditions.push(`fk_fonte_id = ?`);
    values.push(params.fonte);
  }
  if (params.categoria) {
    conditions.push(`categoria = ?`);
    values.push(params.categoria);
  }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `
    SELECT * FROM (
      SELECT 
        *, 
        ROW_NUMBER() OVER (ORDER BY data_publicacao DESC) AS id_virtual 
      FROM ${TABELA_NOTICIAS_NOME}
      ${whereClause}
    ) AS busca_indexada
    WHERE id_virtual BETWEEN ? AND ?
    ORDER BY id_virtual ASC
  `.trim();
  values.push(+params.start, +params.end);
  return { query, values };
}


async function get_all_noticias(params) {
  const {query, values} = queryBuilder(params);
  return new Promise((resolve, reject) => {
    db.all(
      query, 
      values,
      function (err, rows) {
        if (err) {
          return reject(err); 
        }
        resolve(rows);
      }
    );
  })
}

function get_categorias_distintas() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT DISTINCT categoria FROM ${TABELA_NOTICIAS_NOME} WHERE categoria IS NOT NULL ORDER BY categoria`,
      [],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map(r => r.categoria)); 
      }
    );
  });
}


module.exports = { insert_all_into_noticias, get_all_noticias, get_categorias_distintas};