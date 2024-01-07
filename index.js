const express = require("express")
const app = express()

const blogRouter = require("./routers/blog")

app.set("view engine", "ejs")

app.use('/public/', express.static('public'))
app.use('/blog/', blogRouter)

app.get("/", (req, res) => {
    res.render('pages/index')
})

const port = 3000
app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`)
})
