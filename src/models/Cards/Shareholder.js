const Card = require('../Card')

module.exports = class Shareholder extends Card
{
    constructor() {
        super(
            'Shareholder',
            'Lose if discarded.',
            1,
            8,
            false
        )
    }

    /**
     * If the user plays this card they are out.
     * @param player
     */
    apply({ player }) {
        player.isOut = true
        return { success: true, log: `${player.username} is out.` }
    }
}