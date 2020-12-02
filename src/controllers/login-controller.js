const userStore = require('../stores/user-store')

function get(req, res) {
    if (req.session.username) // User already has a username set
        res.redirect('/')

    res.render('login')
}

function post(req, res) {
    if (req.session.username) // User already has a username set
        return res.redirect('/')

    let username = req.body.username

    if (!username) // No username given
        return res.render('login', { error: 'Username is required' })

    username = username.trim()

    if (username.includes(' ')) // No spaces allowed in username
        return res.render('login', { error: 'Username cannot contains spaces', username: username })

    if (username === 'discarded-cards' || username === 'discard-pile') // These are reserved names
        return res.render('login', { error: 'Invalid username', username: username })

    if (username.length < 1 || username.length > 16) // Username does not match length requirements
        return res.render('login', { error: 'Username must be between 1 and 16 characters', username: username })

    if (userStore.isActive(username)) // Username is already being used
        return res.render('login', { error: 'This username is already being used', username: username })

    // Add user to store and set username in session
    userStore.addUser(username)
    req.session.username = username

    res.redirect('/')
}

module.exports = {
    get,
    post,
}