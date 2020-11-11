const Card = require('../Card')

module.exports = class HR extends Card
{
    constructor() {
        super(
            'HR',
            "Look at another player's hand.",
            2,
            2
        )
    }

    /**
     * Let the player see the victim's card.
     * @param player
     * @param victim
     * @return {*} The victim's card
     */
    apply({ player, victim }) {
        if (player.username === victim.username)
            return { success: false, message: 'Why would you look at your own card?' }

        super.apply({ player, victim })
        return {
            success: true,
            victimHand: victim.hand[0].name,
            log: `${player.username} looked at ${victim.username}'s hand.`
        }
    }
}