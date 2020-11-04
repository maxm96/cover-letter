const assert = require('assert')
const P = require('../src/models/Player')
const Wagie = require('../src/models/Cards/Wagie')
const HR = require('../src/models/Cards/HR')

describe('Player', function () {
    describe('playCard', function () {
        const Player = new P('player')
        const Victim = new P('victim')

        it('should remove the played card from the player\'s hand', function () {
            Player.hand.push(new Wagie())
            Player.hand.push(new HR())
            Victim.hand.push(new HR())

            Player.playCard({
                cardName: 'Wagie',
                victim: Victim,
                guess: 'Shareholder'
            })

            assert(Player.hand.length === 1)
        })

        it('should add the played card to the player\'s hand', function () {
            assert(Player.playedCards.length === 1)
        })
    })
})