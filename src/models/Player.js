class Player
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
}