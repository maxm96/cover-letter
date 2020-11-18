const assert = require('assert')
const MotivationalSpeaker = require('../src/models/Cards/MotivationalSpeaker')
const Wagie = require('../src/models/Cards/Wagie')
const CEO = require('../src/models/Cards/CEO')
const Player = require('../src/models/Player')

describe('Motivational Speaker', function () {
    it('should swap player hands', function () {
        const motivationalSpeaker = new MotivationalSpeaker()
        const player = new Player('someuser1')
        const victim = new Player('someuser2')

        player.hand.push(new Wagie())
        victim.hand.push(new CEO())
        
        let res = motivationalSpeaker.apply({ player, victim })

        assert(res.success)
        assert(player.hand[0].name === 'CEO')
        assert(victim.hand[0].name === 'Wagie')
    })
})