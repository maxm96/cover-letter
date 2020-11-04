const fs = require('fs')
const shuffle = require('../utils/shuffle')

module.exports = class Deck
{
    constructor() {
        this.deck = []

        // Create the deck by reading the Card models in the Cards directory
        let cards = fs.readdirSync(__dirname + '/Cards')

        cards.forEach((cardFile) => {
            let stripped = cardFile.replace('.js', '')
            let card = new (require(`./Cards/${stripped}`))()

            for (let i = 0; i < card.count; i++)
                this.deck.push(card)
        })

        // Do a shuffle
        this.deck = shuffle(this.deck)
    }

    get length() {
        return this.deck.length
    }

    draw() {
        if (this.length === 0)
            return console.error('Attempted to draw from an empty deck.')

        return this.deck.pop()
    }
}