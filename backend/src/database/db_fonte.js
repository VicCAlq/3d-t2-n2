const db = require('./db_index.js')
const { 
  TABELA_FONTES_NOME,
  TABELA_NOTICIAS_NOME
} = require('../env.js')
function get_all_fontes() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM ${TABELA_FONTES_NOME}`,
      [],
      function (err, rows) { 
        if (err) {
          return reject(err); 
        }
        
        resolve(rows);
      }
    );
  });
}

function insert_fonte(url, name){
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO ${TABELA_FONTES_NOME}(url, name) VALUES(?, ?)`, 
      [url, name],
      function (err) {
        if (err) {
          return reject(err); 
        }
        resolve(this.lastID);
      }
    );
  });
}

function delete_fonte(id) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION;");

      db.run(
        `DELETE FROM ${TABELA_NOTICIAS_NOME} WHERE fk_fonte_id = ?`,
        [id],
        function (err) {
          if (err) {
            db.run("ROLLBACK;");
            return reject(err);
          }

          db.run(
            `DELETE FROM ${TABELA_FONTES_NOME} WHERE id = ?`,
            [id],
            function (err2) {
              if (err2) {
                db.run("ROLLBACK;");
                return reject(err2);
              }

              db.run("COMMIT;", () => {
                resolve({ success: true, id });
              });
            }
          );
        }
      );
    });
  });
}




module.exports = {
  get_all_fontes,
  insert_fonte,
  delete_fonte
}