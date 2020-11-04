const GameStates = require('./GameStates')
const Player = require('./Player')
const Deck = require('./Deck')
const Cards = {
    'Wagie': require('./Cards/Wagie'),
    'HR': require('./Cards/HR'),
    'Shift Manager': require('./Cards/ShiftManager'),
    'Recommendation Letter': require('./Cards/RecommendationLetter'),
    'Salaried Worker': require('./Cards/SalariedWorker'),
    'Motivational Speaker': require('./Cards/MotivationalSpeaker'),
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
        this.playerTurn = null
        this.currentRound = 0
        this.scores = {}
        this.lastWinner = null // Set this when someone wins a round so they can go first on the next round
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
     * Reset to parts of game state done at the start of each round, also runs at the beginning of each game.
     * Things to be reset each round:
     *  - deck
     *  - current round
     *  - player is* properties
     */
    roundReset() {
        this.deck = new Deck()
        this.currentRound = 0
        this.players.forEach((p) => {
            p.isOut = false
            p.isProtected = false
        })
    }

    /**
     * Reset gameplay state.
     * Things to be reset each game:
     *  - things that need to be reset each round
     *  - last winner
     *  - scores
     *  - log
     */
    gameReset() {
        this.roundReset()
        this.lastWinner = null
        this.scores = this.players.map(p => ({ [p.username]: 0 }))
        this.log = []
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
            // Init the gameplay state
            this.gameReset()
            this.playerTurn = this.players[0].username // Just let the first person go first. TODO: pick a random person

            // Deal a card to everyone
            this.players.forEach(p => p.hand.push(this.deck.draw()))

            // Deal a second one to the first person
            this.players[0].hand.push(this.deck.draw())

            // For now just emit all player's hand on the state change. I actually don't think I can send each individual
            // player their hand from here because I don't know the identifiers. Oh well, maybe I'll make that a separate
            // socket event on the client side.
            let playerHands = {}
            this.players.forEach(p => playerHands[p.username] = p.hand.map(h => h.name))

            this.socketHandle.emit('statechange', {
                state: this.state,
                playerHands: playerHands,
                playerTurn: this.playerTurn
            })
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

        // Prevent duplicate usernames being created from someone making new tabs.
        // Also don't want to broadcast a join if the user is already technically joined.
        if (!this.players.map(p => p.username).includes(username)) {
            let player = new Player(username)
            this.players.push(player)
            return { success: true, username: username, isReady: false }
        }

        return { success: true }
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

    /**
     * This method applies a card's effect on the game. It's a big boy.
     * @param action
     * @return {{success: boolean, update: {applyTo: string | T, properties: {isOut: boolean}}}|{success: boolean, update: null}|{success: boolean, hand: *}|{success: boolean, update: {applyTo: string | T, properties: {isProtected: boolean}}}|{success: boolean, message: string}|{success: boolean, message: string}|{victimIndex: number, success: boolean}}
     */
    onPlayHand(action = null) {
        // Do some validation
        if (this.state !== GameStates.GAMEPLAY)
            return { success: false, message: 'Invalid game state.' }
        if (!action || Object.keys(action).length === 0)
            return { success: false, message: 'Invalid action object.' }
        if (!action.player || this.playerTurn !== action.player)
            return { success: false, message: "It is not the player's turn." }
        if (!action.card)
            return { success: false, message: 'No card given.' }

        // Instantiate the card that is being played
        let playedCard = new Cards[action.card]()

        // If the card requires a victim, validate that the victim exists, is not out, has not disconnected, etc
        let victimIndex = null
        if (playedCard.requiresVictim) {
            let validate = this.validateRequireVictimAction(action.victim)

            if (!validate.success)
                return validate

            victimIndex = validate.victimIndex
        }

        // Get the player index
        let playerIndex = this.getPlayerIndex(action.player)

        // If a player's status is modified we'll send that to the client in an update object
        let update = null

        // TODO: include a log in the response
        switch (action.card) {
            case 'Wagie':
                if (!action.guess)
                    return { success: false, message: 'Must guess a card.' }

                this.players[victimIndex] = playedCard.apply(this.players[victimIndex], action.guess)
                update = {
                    applyTo: this.players[victimIndex].username,
                    properties: {
                        isOut: this.players[victimIndex].isOut
                    }
                }

                return { success: true, update: update }

            case 'HR':
                let victimHand = playedCard.apply(this.players[victimIndex])

                // This card cannot cause any change in the state of the
                // players, so I'll just return the victim's hand.
                return { success: true, hand: victimHand }

            case 'Shift Manager':
                let player = this.players[playerIndex]
                let victim = this.players[victimIndex]

                let loser = playedCard.apply(player, victim)

                // No winner, no update
                if (loser === null)
                    return { success: true, update: null }

                // Set the correct player out
                let loserIndex = loser.username === player.username ? playerIndex : victimIndex
                this.players[loserIndex] = loser

                // Return an update for the losing player
                return {
                    success: true,
                    update: {
                        applyTo: this.players[loserIndex].username,
                        properties: {
                            isOut: true
                        }
                    }
                }

            case 'Recommendation Letter':
                // Protection will last until the player's next turn
                this.players[playerIndex] = playedCard.apply(this.players[playerIndex], this.currentRound + 1)

                return {
                    success: true,
                    update: {
                        applyTo: this.players[playerIndex].username,
                        properties: {
                            isProtected: this.players[playerIndex].isProtected
                        }
                    }
                }

            case 'Salaried Worker':
                this.players[victimIndex] = playedCard.apply(this.players[victimIndex])
                return {
                    success: true,
                    update: {
                        applyTo: this.players[victimIndex].username,
                        properties: {
                            isOut: this.players[victimIndex].isOut
                        }
                    }
                }

            case 'Motivational Speaker':
                let modifiedPlayers = playedCard.apply(this.players[playerIndex], this.players[victimIndex])
                this.players[playerIndex] = modifiedPlayers[0]
                this.players[victimIndex] = modifiedPlayers[1]

                return { success: true, update: null }

            case 'CEO':
                // Not much to do here
                return { success: true, update: null }

            case 'Shareholder':
                this.players[playerIndex] = playedCard.apply(this.players[playerIndex])
                return {
                    success: true,
                    update: {
                        applyTo: this.players[playerIndex].username,
                        properties: {
                            isOut: this.players[playerIndex].isOut
                        }
                    }
                }

            default:
                return { success: false, message: 'Unknown card.' }
        }
    }

    /**
     * Make sure the given victim exists, isn't out, isn't disconnected, and doesn't have protection.
     * @param victim
     * @return {{success: boolean, message: string}|{victimIndex: number, success: boolean}}
     */
    validateRequireVictimAction(victim) {
        if (!victim)
            return { success: false, message: 'Played card requires a victim.' }

        let victimIndex = this.getPlayerIndex(victim)
        if (victimIndex < 0)
            return { success: false, message: `Unknown victim ${victim}.` }

        if (this.players[victimIndex].isOut)
            return { success: false, message: 'Victim is already out.' }
        if (this.players[victimIndex].disconnected)
            return { success: false, message: 'Victim was disconnected.' }
        if (this.players[victimIndex].isProtected)
            return { success: false, message: 'Victim has protection.' }

        return { success: true, victimIndex: victimIndex }
    }

    // ---- Test functions ---- //
    setIsOut(player, isOut) {
        this.players[this.getPlayerIndex(player)].isOut = isOut
    }

    createLog() {

    }
}
