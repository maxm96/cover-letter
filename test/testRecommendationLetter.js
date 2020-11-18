const assert = require('assert')
const RecommendationLetter = require('../src/models/Cards/RecommendationLetter')
const Player = require('../src/models/Player')

describe('Recommendation Letter', function () {
    it('should set player is protected', function () {
        const recommendationLetter = new RecommendationLetter()
        const player = new Player('someuser1')
        const protectedToRound = 4

        assert(!player.isProtected)

        let res = recommendationLetter.apply({ player, protectedToRound })

        assert(res.success)
        assert(player.isProtected === protectedToRound)
    })
})