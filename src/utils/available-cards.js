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
        // Wagie is not in the list of guessable cards
        if (cardFile.includes('Wagie'))
            return

        let stripped = cardFile.replace('.js', '')
        let card = new (require(path.resolve(__dirname, `../models/Cards/${stripped}`)))()
        availableCards.push({ name: card.name, number: card.number })
    })

    return availableCards.sort((a, b) => a.number <= b.number ? -1 : 1)
}