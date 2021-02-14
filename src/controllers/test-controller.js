const availableCards = require('../utils/available-cards')

function get(req, res) {
    if (!req.session.username)
        req.session.username = 'TEST'

    res.render('test', {
        username: req.session.username,
        availableCards: availableCards(),
    })
}

module.exports = { get }