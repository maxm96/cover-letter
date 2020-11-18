const assert = require('assert')
const HR = require('../src/models/Cards/HR')
const Wagie = require('../src/models/Cards/Wagie')
const Player = require('../src/models/Player')

describe('HR', function () {
    it("should return the victim's card", function () {
        const hr = new HR()
        const player = new Player('someuser1')
        const victim = new Player('someuser2')

        victim.hand.push(new Wagie())

        let res = hr.apply({ player, victim })

        assert(res.success)
        assert(res.victimHand.player === 'someuser1')
        assert(res.victimHand.username === 'someuser2')
        assert(res.victimHand.card === 'Wagie')
    })
})