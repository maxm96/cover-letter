const availableCards = require('../utils/available-cards')

function get(req, res) {
    res.render('test', {
        username: req.session.username,
        availableCards: availableCards(),
    })
}

module.exports = { get }