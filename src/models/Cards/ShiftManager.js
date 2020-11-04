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
        let playerCard =  player.hand[0]
        let victimCard = victim.hand[0]

        if (playerCard.number > victimCard.number)
            victim.isOut = true
        else if (victimCard.number > playerCard.number)
            player.isOut = true
    }
}