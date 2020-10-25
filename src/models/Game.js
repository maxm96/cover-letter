GameStates = require('./GameStates')
Player = require('./Player')

module.exports = class Game
{
    constructor() {
        this.deck = []
        this.players = []
        this.state = GameStates.WAITING
        this.log = []
    }

    getPlayerIndex(username) {
        return this.players.findIndex(p => p.username === username)
    }

    createPlayersArray(attrs) {
        return this.players.reduce((acc, cur) => {
            let newObj = {}

            attrs.forEach(a => newObj[a] = cur[a])
            acc.push(newObj)
            return acc
        }, [])
    }

    /**
     * Creates an object to emit to clients. If in waiting state, only send usernames and ready status.
     * If in Gameplay state, send a bit more player information as well as the game log.
     * @param {Object|null} addendum
     * @return {any}
     */
    clientState(addendum = null) {
        let stateObj = {}

        switch (this.state) {
            // Client state in waiting state is just a list of users and ready statuses
            case GameStates.WAITING:
                stateObj = {
                    players: this.createPlayersArray(['username', 'ready']),
                    gameState: this.state
                }
                break
            case GameStates.GAMEPLAY:
                stateObj = {
                    players: this.createPlayersArray(['username', 'isOut', 'isProtected', 'playedCards', 'disconnected']),
                    gameState: this.state,
                    log: this.log
                }
                break
            default:
                break
        }

        return addendum ? Object.assign(addendum, stateObj) : stateObj
    }

    /**
     * If the players are not full and we are in the waiting state,
     * create a new player from username and add to list.
     * @param {string} username
     * @return {Object}
     */
    onConnection(username) {
        // Deny any users if not in the waiting state
        if (this.state !== GameStates.WAITING)
            return { success: false, message: 'Not in waiting state.' }

        if (this.players.length === 4)
            return { success: false, message: 'Maximum number of players has been reached.' }

        let player = new Player(username)

        this.players.push(player)

        return { success: true, username: player.username, isReady: player.isReady }
    }

    /**
     * If a user disconnects during a game, set disconnected to true, otherwise remove the user.
     * @param {string} username
     * @return {Object}
     */
    onDisconnect(username) {
        if (this.state === GameStates.GAMEPLAY) {
            let playerIndex = this.getPlayerIndex(username)
            if (playerIndex < 0)
                return { success: false, message: `Unknown user ${username}.` }

            this.players[playerIndex].disconnected = true
        } else {
            this.players = this.players.filter(p => p.username !== username)
        }

        return { success: true, username: username }
    }

    /**
     * Set a player's ready status to ready and check if all players are ready.
     * @param {string} username
     * @param {Boolean} ready
     * @return {Object}
     */
    onReady(username, ready) {
        if (ready && this.state !== GameStates.WAITING)
            return { success: false, message: 'Not in waiting state.' }
        else if (!ready && (this.state !== GameStates.WAITING || this.state !== GameStates.COUNTDOWN))
            return { success: false, message: 'Game is not in a valid state.' }

        let playerIndex = this.getPlayerIndex(username)
        if (playerIndex < 0)
            return { success: false, message: `Unknown user ${username}.` }

        this.players[playerIndex].ready = ready

        if (this.players.every(p => p.ready))
            this.state = GameStates.COUNTDOWN
        else
            this.state = GameStates.WAITING

        return { success: true, username: username, ready: ready, gameState: this.state }
    }

    createLog() {

    }
}
