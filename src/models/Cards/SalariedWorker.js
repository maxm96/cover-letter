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
     * @param victim
     * @return {Player} The modified victim
     */
    apply(victim) {
        let victimCard = victim.hand.pop()

        if (victimCard.number === 8)
            victim.isOut = true

        return victim
    }
}