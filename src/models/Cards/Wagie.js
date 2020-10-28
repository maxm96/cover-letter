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
     * @param victim
     * @param {string} guess
     * @return {Player} The modified victim
     */
    apply(victim, guess) {
        if (victim.hand[0].name === guess)
            victim.isOut = true
        return victim
    }
}