const Card = require('../Card')

module.exports = class ShiftManager extends Card
{
    constructor() {
        super(
            'Shift Manager',
            'Compare hands with another player; lowest hand is out.',
            2,
            3
        )
    }

    /**
     * If a player has a lower card number than the other, they are out.
     * @param player
     * @param victim
     */
    apply({ player, victim }) {
        if (player.username === victim.username)
            return { success: false, message: "You can't compare hands with yourself." }

        let playerCard =  player.hand[0]
        let victimCard = victim.hand[0]
        let log = ''

        if (playerCard.number > victimCard.number) {
            victim.isOut = true
            log = `${player.username} has a larger card than ${victim.username}.`
        } else if (victimCard.number > playerCard.number) {
            player.isOut = true
            log = `${player.username} had a smaller card than ${victim.username}.`
        } else
            log = `${player.username} and ${victim.username} has identical cards.`

        return { success: true, log: log }
    }
}