const assert = require('assert')
const Wagie = require('../src/models/Cards/Wagie')
const HR = require('../src/models/Cards/HR')
const Player = require('../src/models/Player')

describe('Wagie', function () {
    it('should not set victim out if guess is wrong', function () {
        const wagie = new Wagie()
        const player = new Player('someuser1')
        const victim = new Player('someuser2')

        victim.hand.push(new HR())

        let res = wagie.apply({ player: player, victim: victim, guess: 'CEO' })

        assert(res.success)
        assert(!victim.isOut)
    })

    it('should set victim out if guess is correct', function () {
        const wagie = new Wagie()
        const player = new Player('someuser1')
        const victim = new Player('someuser2')

        victim.hand.push(new HR())

        let res = wagie.apply({ player: player, victim: victim, guess: 'HR' })

        assert(res.success)
        assert(victim.isOut)
    })
})