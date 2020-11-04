const Card = require('../Card')

module.exports = class MotivationalSpeaker extends Card
{
    constructor() {
        super(
            'Motivational Speaker',
            'Trade hands with another player.',
            1,
            6
        )
    }

    /**
     * Swap hands.
     * @param player
     * @param victim
     */
    apply({ player, victim }) {
        if (player.username === victim.username)
            return { success: false, message: "You can't swap hands with yourself." }

        let temp = player.hand
        player.hand = victim.hand
        victim.hand = temp

        return { success: true }
    }
}