function get(req, res) {
    if (!req.session.username) // User needs to log in before accessing any other page
        return res.redirect('/login')

    res.render('index', { username: req.session.username })
}

module.exports = { get }