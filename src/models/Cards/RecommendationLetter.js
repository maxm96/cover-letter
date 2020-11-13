const Card = require('../Card')

module.exports = class RecommendationLetter extends Card
{
    constructor() {
        super(
            'Recommendation Letter',
            'Protection until your next turn.',
            2,
            4,
            false,
            true
        )
    }

    /**
     * Gives player protection until their next turn.
     * @param player
     * @param protectedToRound
     * @return {*}
     */
    apply({ player, protectedToRound }) {
        player.isProtected = protectedToRound

        super.apply({ player })
        return { success: true, log: `${player.username} is protected until the next round.` }
    }
}