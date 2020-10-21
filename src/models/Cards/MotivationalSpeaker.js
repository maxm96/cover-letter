class MotivationalSpeaker extends Card
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
     * @param {Player} player
     * @param {Player} victim
     * @return {Array} A tuple of (modified_player, modified_victim)
     */
    apply(player, victim) {
        let temp = player.hand
        player.hand = victim.hand
        victim.hand = temp

        return [player, victim]
    }
}