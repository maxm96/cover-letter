const assert = require('assert')
const ShiftManager = require('../src/models/Cards/ShiftManager')
const Shareholder = require('../src/models/Cards/Shareholder')
const Wagie = require('../src/models/Cards/Wagie')
const Player = require('../src/models/Player')

describe('Shift Manager', function () {
    it('should set the player with the lowest card out', function () {
        const shiftManager = new ShiftManager()
        const player = new Player('someuser1')
        const victim = new Player('someuser2')

        player.hand.push(new Shareholder())
        victim.hand.push(new Wagie())

        let res = shiftManager.apply({ player, victim })

        assert(res.success)
        assert(!player.isOut)
        assert(victim.isOut)
    })

    it('should not set anyone out in case of a tie', function () {
        const shiftManager = new ShiftManager()
        const player = new Player('someuser1')
        const victim = new Player('someuser2')

        player.hand.push(new Wagie())
        victim.hand.push(new Wagie())

        let res = shiftManager.apply({ player, victim })

        assert(res.success)
        assert(!player.isOut)
        assert(!victim.isOut)
    })
})