class HR extends Card
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
     * @param {Player} victim
     * @return {Card} The victim's card
     */
    apply(victim) {
        return victim.hand[0]
    }
}