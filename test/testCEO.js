const assert = require('assert')
const CEO = require('../src/models/Cards/CEO')
const Player = require('../src/models/Player')

describe('CEO', function () {
    it("shouldn't do anything", function () {
        const ceo = new CEO()
        const player = new Player('someuser1')

        let res = ceo.apply({ player })

        assert(res.success)
        assert(!player.isOut)
    })
})