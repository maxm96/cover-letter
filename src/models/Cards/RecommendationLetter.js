const Card = require('../Card')

module.exports = class RecommendationLetter extends Card
{
    constructor() {
        super(
            'Recommendation Letter',
            'Protection until your next turn.',
            2,
            4,
            false
        )
    }

    /**
     * Gives player protection until their next turn.
     * @param player
     * @param protectedToRound
     */
    apply({ player, protectedToRound }) {
        player.isProtected = protectedToRound
        return { success: true }
    }
}