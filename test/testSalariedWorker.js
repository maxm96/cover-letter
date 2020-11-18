const assert = require('assert')
const SalariedWorker = require('../src/models/Cards/SalariedWorker')
const Wagie = require('../src/models/Cards/Wagie')
const Shareholder = require('../src/models/Cards/Shareholder')
const Player = require('../src/models/Player')

describe('Salaried Worker', function () {
    it("should remove the victim's card", function () {
        const salariedWorker = new SalariedWorker()
        const player = new Player('someuser1')
        const victim = new Player('someuser2')

        victim.hand.push(new Wagie())

        let res = salariedWorker.apply({ player, victim })

        assert(res.success)
        assert(victim.hand.length === 0)
    })

    it('should set victim out if they have the Shareholder', function () {
        const salariedWorker = new SalariedWorker()
        const player = new Player('someuser1')
        const victim = new Player('someuser2')

        victim.hand.push(new Shareholder())

        let res = salariedWorker.apply({ player, victim })

        assert(res.success)
        assert(victim.isOut)
    })
})