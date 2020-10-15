function get(req, res) {
    if (!req.session.username) // User needs to log in before accessing any other page
        return res.redirect('/login')

    res.send(`Hello ${req.session.username}!`)
}

module.exports = { get }