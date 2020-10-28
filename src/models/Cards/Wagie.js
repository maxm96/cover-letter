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
     * @param victim
     * @param {string} guess
     * @return {Player} victim The modified victim
     */
    apply(victim, guess) {
        // Victim should only have one card, just print an error if this happens for now
        if (victim.hand.length > 1)
            console.log('Received Wagie victim with more than one card.')

        if (victim.hand[0].name === guess)
            victim.isOut = true

        return victim
    }
}