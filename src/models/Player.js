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

        // Keep track of how many connections one user is opening. This is so
        // 1. the user can't have multiple tabs open as that causes problems and
        // 2. a disconnect from one tab will not cause the player's status to be
        // set to disconnected if they still have another connection open.
        this.connections = 1
    }

    get needsCard() {
        return !this.isOut && !this.disconnected && this.hand.length === 0
    }

    /**
     * Get the index of the card matching the given card name.
     * @param cardName
     * @return {number}
     */
    getCardIndex(cardName) {
        let cardIndex = this.hand.findIndex(c => c.name === cardName)
        if (cardIndex < 0)
            throw new Error(`No card found for ${cardName}`)

        return cardIndex
    }

    /**
     * Return the card from the player's hand that matches the given card name.
     * @param cardName
     * @return {*}
     */
    getCard(cardName) {
        let cardIndex = this.getCardIndex(cardName)
        let card = this.hand[cardIndex]
        this.hand.splice(cardIndex, 1)

        return card
    }

    /**
     * Returns the player's card matching the given card name but does not remove it from the player's hand.
     * @param cardName
     * @return {*}
     */
    peekCard(cardName) {
        let cardIndex = this.getCardIndex(cardName)
        return {...this.hand[cardIndex]}
    }

    canPlayCard(cardName) {
        // Cannot play the Motivational Speaker or Salaried Worker if the player also has the CEO
        if ((cardName === 'Motivational Speaker' || cardName === 'Salaried Worker')
            && this.hand.some(c => c.name === 'CEO'))
            return { success: false, message: 'Must play the CEO.' }
        return true
    }

    /**
     * Discard the given card.
     * @param {string} cardName
     * @return {*|{log: string, success: boolean}}
     */
    discardCard(cardName) {
        let canPlayCard = this.canPlayCard(cardName)
        if (canPlayCard !== true)
            return canPlayCard

        let card = this.getCard(cardName)
        this.playedCards.push(card)
        return card.discard({ player: this })
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
        let canPlayCard = this.canPlayCard(cardName)
        if (canPlayCard !== true)
            return canPlayCard

        victim = victim || this
        let card = this.getCard(cardName)

        this.playedCards.push(card)

        return card.apply({ player: this, victim: victim, guess: guess, protectedToRound: protectedToRound })
    }
}