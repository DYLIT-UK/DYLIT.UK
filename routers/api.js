var router = require('express').Router()

const API_BASE = "https://s.ndemiccreations.com/plague"
const API_ENDPOINTS = {
    "SEARCH": `${API_BASE}/scenarios?from={offset}&ln=en&search={query}`,
}

router.get('/psearch/:offset/', async (req, res) => {
    var offset = req.params.offset

    res.send((await (await fetch(API_ENDPOINTS.SEARCH.replace("{offset}", offset).replace("{query}", ""))).json()))
})

router.get('/psearch/:offset/:query', async (req, res) => {
    var offset = req.params.offset
    var query = req.params.query

    res.send((await (await fetch(API_ENDPOINTS.SEARCH.replace("{offset}", offset).replace("{query}", query))).json()))
})

module.exports = router