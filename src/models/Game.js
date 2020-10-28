GameStates = require('./GameStates')
Player = require('./Player')
const Cards = {
    'Wagie': require('./Cards/Wagie'),
    'ShiftManager': require('./Cards/ShiftManager'),
    'RecommendationLetter': require('./Cards/RecommendationLetter'),
    'SalariedWorker': require('./Cards/SalariedWorker'),
    'MotivationalSpeaker': require('./Cards/MotivationalSpeaker'),
    'CEO': require('./Cards/CEO'),
    'Shareholder': require('./Cards/Shareholder')
}

module.exports = class Game
{
    constructor(socketHandle = null) {
        // I would like to leave the handling of socket events outside of this class, however,
        // I need to be able to emit game state change from here so... it is what it is.
        // Create a phony socket handle if not given one (as is the case with tests).
        this.socketHandle = socketHandle || { emit: (event) => event }

        this.deck = []
        this.players = []
        this.state = GameStates.WAITING
        this.log = []
        this.timeoutHandle = null
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

    changeState(state) {
        this.state = state

        // Clear any timeouts
        if (this.timeoutHandle !== null) {
            clearTimeout(this.timeoutHandle)
            this.timeoutHandle = null
        }

        if (state === GameStates.COUNTDOWN) {
            // In 5 seconds start the game
            this.timeoutHandle = setTimeout(() => {
                this.changeState(GameStates.GAMEPLAY)
            }, 5000)
        }

        if (state === GameStates.GAMEPLAY) {
            // Need some way to broadcast game start from here
            this.socketHandle.emit('statechange', { state: this.state })
        }
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
        // Sanity check
        let playerIndex = this.getPlayerIndex(username)
        if (playerIndex < 0)
            return { success: false, message: `Unknown user ${username}` }

        if (this.state === GameStates.GAMEPLAY)
            this.players[playerIndex].disconnected = true
        else {
            this.players = this.players.filter(p => p.username !== username)

            // Cancel the countdown if someone gets disconnected
            if (this.state === GameStates.COUNTDOWN)
                this.changeState(GameStates.WAITING)
        }

        return { success: true, username: username, state: this.state }
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
        // Can't toggle ready if game is in progress
        else if (!ready && this.state === GameStates.GAMEPLAY)
            return { success: false, message: 'Game is not in a valid state.' }

        let playerIndex = this.getPlayerIndex(username)
        if (playerIndex < 0)
            return { success: false, message: `Unknown user ${username}.` }

        this.players[playerIndex].ready = ready

        if (this.players.every(p => p.ready))
            this.changeState(GameStates.COUNTDOWN)
        else
            this.changeState(GameStates.WAITING)

        return { success: true, username: username, ready: ready, gameState: this.state }
    }

    onPlayHand(action = null) {
        if (this.state !== GameStates.GAMEPLAY)
            return { success: false, message: 'Invalid game state.' }
        if (!action || Object.keys(action).length === 0)
            return { success: false, message: 'Invalid action object.' }
        if (!action.card)
            return { success: false, message: 'No card given.' }

        let playedCard = new Cards[action.card]()

        switch (action.card) {
            case 'Wagie':
                break
            case 'ShiftManager':
                break
            case 'RecommendationLetter':
                break
            case 'SalariedWorker':
                break
            case 'MotivationalSpeaker':
                break
            case 'CEO':
                break
            case 'Shareholder':
                break
            default:
                return { success: false, message: 'Unknown card.' }
        }
    }

    createLog() {

    }
}
