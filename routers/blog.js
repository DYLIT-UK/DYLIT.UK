var router = require('express').Router()
var fs = require('fs')
// const db = new MongoClient('mongodb://localhost:27017').db("DYLITUK")
// const postsCol = db.collection("posts")

var units = {
    year  : 24 * 60 * 60 * 1000 * 365,
    month : 24 * 60 * 60 * 1000 * 365/12,
    day   : 24 * 60 * 60 * 1000,
    hour  : 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000
}

var rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

var getRelativeTime = (d1, d2 = new Date()) => {
    var elapsed = d1 - d2

    for (var u in units)
        if (Math.abs(elapsed) > units[u] || u == 'second')
            return rtf.format(Math.round(elapsed/units[u]), u)
}

var getPostInfo = (folder) => {
    if(!fs.existsSync(`./posts/${folder}/info.json`) || !fs.existsSync(`./posts/${folder}/content.html`)) {
        return {
            title: "...",
            created: new Date(),
            updated: new Date(),
            content: "website issue lol, please ignore this entry"
        }
    }

    var post = JSON.parse(fs.readFileSync(`./posts/${folder}/info.json`))

    post.content = fs.readFileSync(`./posts/${folder}/content.html`).toString()
    post.created = new Date(post.created)
    post.updated = new Date(post.updated)
    post.slug = folder

    return post
}

router.get('/', (req, res) => {
    // var posted = new Date()
    // var updated = new Date(posted.getTime() + (units.month * 2))

    // var blog_posts = await postsCol.find().toArray()

    // blog_posts.forEach(post => {
    //     post.created = new Date(post.created)
    //     post.updated = new Date(post.updated)
    // })

    var blog_posts = fs.readdirSync('./posts').map(folder => {
        return getPostInfo(folder)
    })

    res.render('pages/blog_home', { blog_posts, getRelativeTime })
})

router.get('/:id', (req, res) => {
    var blog_id = req.params.id

    // var title = "Placeholder"
    // var posted = new Date()
    // var updated = new Date(posted.getTime() - (units.month * 2))
    // var content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    // var data = {
    //     title, posted, updated, content
    // }

    // var post = await postsCol.findOne({ _id: new ObjectId(blog_id) })

    var post = fs.readdirSync('./posts').filter(folder => folder == blog_id).map(folder => {
        return getPostInfo(folder)
    })[0]

    if (post == null) {
        res.redirect('/blog')
        return
    }

    res.render('pages/blog_post', { post, getRelativeTime })
})

module.exports = router