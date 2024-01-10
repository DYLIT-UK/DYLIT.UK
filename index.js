const express = require("express")
const app = express()

const blogRouter = require("./routers/blog")
const apiRouter = require("./routers/api")

app.set("view engine", "ejs")

app.use('/public/', express.static('public'))
app.use('/blog/', blogRouter)
app.use('/api/', apiRouter)

app.get("/", (req, res) => {
  res.render('pages/index')
})

app.get("/card-details/", (req, res) => {
  res.render('pages/card-details')
})

app.get("/plague-inc/", (req, res) => {
  res.render('pages/plagueincbrowser.ejs')
})

const port = 3000
app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`)
})
