GameStates = require('./GameStates')

class Game
{
    constructor(deck, players = []) {
        this.deck = deck
        this.players = players
        this.state = GameStates.WAITING
        this.log = []
    }

    getPlayerIndex(username) {
        return this.players.findIndex(p => p.username === username)
    }

    /**
     * If the players are not full and we are in the waiting state,
     * create a new player from username and add to list.
     * @param {string} username
     * @return {{success: boolean, message: string}|{success: boolean}}
     */
    acceptUser(username) {
        // Deny any users if not in the waiting state
        if (this.state !== GameStates.WAITING)
            return { success: false, message: 'Not in waiting state.' }

        if (this.players.length === 4)
            return { success: false, message: 'Maximum number of players has been reached.' }

        this.players.push(new Player(username))
        return { success: true }
    }

    /**
     * If a user disconnects during a game, set disconnected to true, otherwise remove the user.
     * @param {string} username
     * @return {{success: boolean, message: string}|{success: boolean}}
     */
    removeUser(username) {
        if (this.state === GameStates.GAMEPLAY) {
            let playerIndex = this.getPlayerIndex(username)
            if (playerIndex < 0)
                return { success: false, message: `Unknown user ${username}.` }

            this.players[playerIndex].disconnected = true
        } else {
            this.players = this.players.filter(p => p.username !== username)
        }

        return { success: true }
    }

    /**
     * Set a player's ready status to true and check if all players are ready.
     * @param {string} username
     * @return {{success: boolean, message: string}|{success: boolean}}
     */
    onReady(username) {
        if (this.state !== GameStates.WAITING)
            return { success: false, message: 'Not in waiting state.' }

        let playerIndex = this.getPlayerIndex(username)
        if (playerIndex < 0)
            return { success: false, message: `Unknown user ${username}.` }

        this.players[playerIndex].ready = true

        if (this.players.every(p => p.ready))
            this.state = GameStates.GAMEPLAY

        return { success: true }
    }

    /**
     * Set a player's ready status to false.
     * @param {string} username
     * @return {{success: boolean, message: string}|{success: boolean}}
     */
    onUnReady(username) {
        if (this.state !== GameStates.WAITING || this.state !== GameStates.COUNTDOWN)
            return { success: false, message: 'Game is not in a valid state to unready.' }

        let playerIndex = this.getPlayerIndex(username)
        if (playerIndex < 0)
            return { success: false, message: `Unknown user ${username}.` }

        this.players[playerIndex].ready = false

        return { success: true }
    }

    createLog() {

    }
}
