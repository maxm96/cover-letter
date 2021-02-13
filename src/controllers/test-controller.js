const availableCards = require('../utils/available-cards')

function get(req, res) {
    res.render('test', { availableCards: availableCards() })
}

module.exports = { get }