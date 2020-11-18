const assert = require('assert')
const Shareholder = require('../src/models/Cards/Shareholder')
const Player = require('../src/models/Player')

describe('Shareholder', function () {
    it('should set the player out', function () {
        const shareholder = new Shareholder()
        const player = new Player('someuser1')

        let res = shareholder.apply({ player })

        assert(res.success)
        assert(player.isOut)
    })
})