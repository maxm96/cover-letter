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
        if (guess === this.name)
            return { success: false, message: "Can't guess another Wagie." }
        if (player.username === victim.username)
            return { success: false, message: "Why would you guess yourself?" }

        if (victim.hand[0].name === guess)
            victim.isOut = true

        return { success: true }
    }
}