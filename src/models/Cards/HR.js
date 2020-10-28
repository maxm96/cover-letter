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
     * @param victim
     * @return {Card} The victim's card
     */
    apply(victim) {
        return victim.hand[0].name
    }
}