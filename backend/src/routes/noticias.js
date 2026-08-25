const express = require("express");
const router = express.Router();

const {get_all_noticias, get_categorias_distintas} = require("./../database/db_noticias")

router.get("", async (request, response) => {
        const { fonte, categoria, start, end } = request.query;
        const all_news = await get_all_noticias({fonte, categoria, start, end})
        
        response.json({content: all_news})
})

router.get("/categories", async (_, response)=>{
    const result = await get_categorias_distintas();
    response.json(result)
})



module.exports = router;