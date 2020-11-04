module.exports = class Player
{
    constructor(username) {
        this.username = username
        this.ready = false // Used when game is in waiting state
        this.isOut = false // True if the user is out
        this.isProtected = false // True if the user has protection
        this.hand = [] // The user's hand
        this.playedCards = [] // The user's played cards
        this.disconnected = false // True if the user disconnects during a game
    }

    get needsCard() {
        return this.hand.length === 0
    }

    /**
     * Return the card from the player's hand that matches the given card name.
     * @param cardName
     * @return {*}
     */
    getCard(cardName) {
        let cardIndex = this.hand.findIndex(c => c.name === cardName)
        if (cardIndex < 0)
            throw new Error(`No card found for ${cardName}`)

        let card = this.hand[cardIndex]
        this.hand = this.hand.splice(cardIndex - 1, 1)

        return card
    }

    /**
     * Play the given card against a victim. Other properties can be passed in i.e. guess for Wagie.
     * @param cardName
     * @param victim
     * @param guess
     * @param protectedToRound
     * @return {*} The success status of applying the card or the results
     * of applying the card i.e. the victim's card name with HR
     */
    playCard({ cardName, victim, guess, protectedToRound }) {
        victim = victim || this
        let card = this.getCard(cardName)

        this.playedCards.push(card)

        return card.apply({ player: this, victim: victim, guess: guess, protectedToRound: protectedToRound })
    }
}