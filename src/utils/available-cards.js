const fs = require('fs')
const path = require('path')

/**
 * Returns an array of the available card names.
 * @return {[]}
 */
module.exports = function () {
    let cards = fs.readdirSync(path.resolve(__dirname, '../models/Cards'))
    let availableCards = []

    cards.forEach((cardFile) => {
        let stripped = cardFile.replace('.js', '')
        let card = new (require(path.resolve(__dirname, `../models/Cards/${stripped}`)))()
        availableCards.push(card.name)
    })

    return availableCards
}