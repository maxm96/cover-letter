const assert = require('assert')
const D = require('../src/models/Deck')
const Card = require('../src/models/Card')
const fs = require('fs')
const path = require('path')

// Get the total number of cards that will be in a deck from the classes in the Cards directory
function getCardCount() {
    let cardsDir = path.resolve(__dirname, '../src/models/Cards')

    return fs.readdirSync(cardsDir).reduce((acc, cur) => {
        let stripped = cur.replace('.js', '')
        return acc += (new (require(`../src/models/Cards/${stripped}`))).count
    }, 0)
}

describe('Deck', function () {
    describe('constructor', function () {
        const Deck = new D()

        it('should contain the correct number of cards', function () {
            assert(Deck.length === getCardCount())
        })
    })

    describe('draw', function () {
        const Deck = new D()

        it('should return the next card', function () {
            let card = Deck.draw()
            assert(card instanceof Card)
        })

        it('should return undefined if the deck is empty', function () {
            // One card is missing from the previous draw
            let cardCount = getCardCount() - 1

            for (let i = 0; i < cardCount; i++)
                Deck.draw()

            let card = Deck.draw()
            assert(card === undefined)
        })
    })
})