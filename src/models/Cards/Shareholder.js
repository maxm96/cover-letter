module.exports = class Shareholder extends Card
{
    constructor() {
        super(
            'Shareholder',
            'Lose if discarded.',
            1,
            8
        )
    }

    /**
     * If the user plays this card they are out.
     * @param {Player} player
     * @return {Player}
     */
    apply(player) {
        player.isOut = true
        return player
    }
}