const UserStore = require('../stores/user-store')

function get(req, res) {
    let username = req.session.username

    if (!username) // User needs to log in before accessing any other page
        return res.redirect('/login')

    // When running locally the user store gets reset between sessions,
    // so if a user gets here with a username but does not yet exist in
    // the user store, reset session and redirect to login page
    if (!UserStore.userExists(username)) {
        req.session.destroy((err) => {
            if (err) {
                console.error(`Error destroying session: ${err}`)
                return
            }

            console.log(`${username} has logged out`)
        })

        return res.redirect('/login')
    }

    res.render('index', { username: req.session.username })
}

module.exports = { get }