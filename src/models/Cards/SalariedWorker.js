const Card = require('../Card')

module.exports = class SalariedWorker extends Card
{
    constructor() {
        super(
            'Salaried Worker',
            'Choose a player to discard their hand, or discard your hand.',
            2,
            5
        )
    }

    /**
     * Remove the card from victim, see if they are out.
     * @param player
     * @param victim
     * @return {*}
     */
    apply({ player, victim }) {
        let victimCard = victim.hand.pop()
        victim.playedCards.push(victimCard)

        if (victimCard.number === 8)
            victim.isOut = true

        super.apply({ player, victim })
        return { success: true, log: `${victim.username} discarded ${victimCard.name}.` }
    }
}