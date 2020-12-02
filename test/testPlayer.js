const assert = require('assert')
const P = require('../src/models/Player')
const Wagie = require('../src/models/Cards/Wagie')
const HR = require('../src/models/Cards/HR')
const CEO = require('../src/models/Cards/CEO')
const MotivationalSpeaker = require('../src/models/Cards/MotivationalSpeaker')
const SalariedWorker = require('../src/models/Cards/SalariedWorker')

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

        it('should not let the player play the Motivational Speaker or Salaried Worker card if they also have the CEO', function () {
            Player.hand = [new CEO(), new SalariedWorker()]
            let res = Player.playCard({ cardName: 'Salaried Worker' })

            assert(!res.success)
            assert(res.message.length)

            Player.hand = [new CEO(), new MotivationalSpeaker()]
            res = Player.playCard({ cardName: 'Motivational Speaker' })

            assert(!res.success)
            assert(res.message.length)

            // Also cannot discard the Motivational Speaker or Salaried Worker with the CEO
            Player.hand = [new CEO(), new SalariedWorker()]
            res = Player.discardCard('Salaried Worker')

            assert(!res.success)
            assert(res.message.length)

            Player.hand = [new CEO(), new MotivationalSpeaker()]
            res = Player.discardCard('Motivational Speaker')

            assert(!res.success)
            assert(res.message.length)
        })
    })
})