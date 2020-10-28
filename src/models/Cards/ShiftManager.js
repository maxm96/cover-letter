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
     * If one of the player's card's number is less than the other, that player is out.
     * Return null if there is a tie, else return the modified loser.
     * @param player
     * @param victim
     * @return {Player|null} The losing player
     */
    apply(player, victim) {
        // Get the card that is not the Shift Manager, or the second Shift Manager if the player has two
        let playerCard = player.hand[0].number === 3 ? player.hand[1] : player.hand[0]
        let victimCard = victim.hand[0]

        if (playerCard.number === victimCard.number)
            return null

        if (playerCard.number > victimCard.number) {
            victim.isOut = true
            return victim
        } else {
            player.isOut = true
            return player
        }
    }
}