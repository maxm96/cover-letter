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
     * @param {Player} player
     * @return {Player} The modified player
     */
    apply(player) {
        player.isProtected = true
        return player
    }
}