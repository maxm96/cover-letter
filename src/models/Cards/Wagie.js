const Card = require('../Card')

module.exports = class Wagie extends Card
{
    constructor() {
        super(
            'Wagie',
            "Guess another player's hand. Cannot guess a Wagie.",
            5,
            1
        )
    }

    /**
     * If the guess matches the victim's card, the victim is out.
     * @param player
     * @param victim
     * @param guess
     * @return {*}
     */
    apply({ player, victim, guess }) {
        if (victim.hand[0].name === guess)
            victim.isOut = true
    }
}