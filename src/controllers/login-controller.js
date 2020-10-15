const userStore = require('../stores/user-store')

function get(req, res) {
    if (req.session.username) // User already has a username set
        res.redirect('/')

    res.sendFile('login.html', { root: 'src/views' })
}

function post(req, res) {
    if (req.session.username) // User already has a username set
        return res.redirect('/')

    let username = req.body.username

    if (!username) // No username given
        return res.sendFile('login.html', { root: 'src/views' })

    username = username.trim()

    if (username.length < 1 || username.length > 16) // Username does not match length requirements
        return res.sendFile('login.html', { root: 'src/views' })

    if (userStore.isActive(username)) // Username is already being used
        return res.sendFile('login.html', { root: 'src/views' })

    // Add user to store and set username in session
    userStore.addUser(username)
    req.session.username = username

    res.redirect('/')
}

module.exports = {
    get,
    post,
}