const express = require("express");
const { insert_fonte, get_all_fontes, delete_fonte } = require("../database/db_fonte")
const { insert_all_into_noticias } = require("../database/db_noticias")
const { XMLParser } = require('fast-xml-parser');
const router = express.Router();

const parser = new XMLParser();
router.post("/", async (request, response) => {
  try {
    const { url: fonte_url, name: fonte_name } = request.body;
    const verificarURL = (str) => /^(https?:\/\/)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(str);
    if (!verificarURL(fonte_url)) throw new Error("LINK INVALIDO");

    const fk_id = await insert_fonte(fonte_url, fonte_name);
    const respostaHTTP = await fetch(fonte_url);
    const responseText = await respostaHTTP.text();
    const json = parser.parse(responseText);
    const noticias = json.rss.channel.item;

    const resultado = await insert_all_into_noticias(noticias, fk_id); 
    response.json({ success: true, ...resultado });
  } catch (e) {
    console.log(e);
    response.status(400).json({ content: e.message });
  }
});

router.get("", async (request, response) => {

    const data = await get_all_fontes()
    response.json({
        content: data
    })
})

router.delete("/:id", (request, response) => {
    try {
        const id = request.params.id
        delete_fonte(id);
        response.status(204).json({ content: `Fonte de id: ${id}` })
    }
    catch (e) {
        console.log(e)
        response.send(400).json({ content: `Erro ao apagar fonte de id: ${id}` })
    }
})


module.exports = router;