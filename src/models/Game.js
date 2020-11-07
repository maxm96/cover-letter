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
     * Advance the playerTurn to the next viable player.
     */
    advanceTurn() {
        // Get an array of players that are not out or disconnected (it should still be in turn order)
        // Also keep in the player whose turn it is currently
        let players = this.players.filter(p => p.username === this.playerTurn || (!p.isOut && !p.disconnected))

        // Get the index of the player who's turn it is right now
        let playerTurnIndex = players.findIndex(p => p.username === this.playerTurn) + 1

        // Wrap index to keep in bounds of array
        if (players[playerTurnIndex] === undefined)
            playerTurnIndex = 0

        this.playerTurn = players[playerTurnIndex].username
    }

    /**
     * Returns the winning username if there is only one person left in. Returns false otherwise.
     * @return {boolean|string}
     */
    checkForEliminationVictory() {
        let inPlayers = this.players.filter(p => !p.isOut)
        if (inPlayers.length === 1)
            return inPlayers[0].username

        return false
    }

    /**
     * Checks for a victory by card number. Returns false if there can't be a card victory (i.e. still cards left in
     * deck). Handles a tie by computing the highest score of played cards by the tying players.
     * @return {null|string|boolean}
     */
    checkForCardVictory() {
        // If there are still cards, keep playing
        if (this.deck.length !== 0)
            return false

        // Filter out players who are out, keep track of the players with the highest score
        let highestHand = this.players.filter(p => !p.isOut).reduce((acc, cur) => {
            // This is a new high score, set new score and reset players array
            if (cur.hand[0].number > acc.score) {
                acc.score = cur.hand[0].number
                acc.players = [cur]
            }
            // This is an existing score, push the current player onto the players array
            else if (cur.hand[0].number === acc.score)
                acc.players.push(cur)

            return acc
        }, { score: 0, players: [] })

        // If there is no tie, return the winner
        if (highestHand.players.length === 1)
            return highestHand.players[0].username

        // If there is a tie, get the max of the played cards from each player. Whoever has that is the winner.
        let highestPlayed = highestHand.players
            .map((p) => (
                { username: p.username, score: p.playedCards.reduce((acc, cur) => acc += cur.number, 0) }
            ))
            .reduce((acc, cur) => acc = cur.score > acc.score ? cur : acc, { score: 0, username: null })

        // And finally we have our winner
        return highestPlayed.username
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
            this.players
                .forEach(p => playerHands[p.username] = p.hand.map(h =>
                    ({ name: h.name, number: h.number, description: h.description })
                ))

            this.socketHandle.emit('statechange', {
                state: this.state,
                playerHands: playerHands,
                playerTurn: this.playerTurn,
                deckCount: this.deck.length
            })
        }
    }

    /**
     * Creates an object to emit to clients. If in waiting state, only send usernames and ready status.
     * If in Gameplay state, send a bit more player information.
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
                    scores: this.scores
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

    onPlayHand({ cardName, playerName, victimName, guess }) {
        // Do some validation
        if (this.state !== GameStates.GAMEPLAY)
            return { success: false, message: 'Invalid game state.' }
        if (!playerName || this.playerTurn !== playerName)
            return { success: false, message: "It is not the player's turn." }
        if (!cardName)
            return { success: false, message: 'No card given.' }

        // Make sure that the player exists
        let playerIndex = this.getPlayerIndex(playerName)
        if (playerIndex < 0)
            return { success: false, message: `Unknown player ${playerName}.` }

        let player = this.players[playerIndex]

        // If given a victim name, make sure the victim exists and is not protected, out, or disconnected
        let victim = null
        if (victimName) {
            let victimIndex = this.getPlayerIndex(victimName)
            if (victimIndex < 0)
                return { success: false, message: `Unknown player ${victimName}.` }

            victim = this.players[victimIndex]

            if (victim.isOut)
                return { success: false, message: `${victimName} is already out.` }
            if (victim.disconnected)
                return { success: false, message: `${victimName} was disconnected.` }
            if (victim.isProtected >= this.currentRound)
                return { success: false, message: `Victim has protection until round ${victim.isProtected}.` }
        }

        // Play the card
        let res = player.playCard({
            cardName: cardName,
            victim: victim,
            guess: guess,
            protectedToRound: this.currentRound + 1
        })

        // Return response early if playCard fails
        if (!res.success)
            return res

        // Only one or zero players should need a new card, so order shouldn't matter
        if (player.needsCard && this.deck.length)
            player.hand.push(this.deck.draw())
        if (victim && victim.needsCard && this.deck.length)
            victim.hand.push(this.deck.draw())

        // Update player turn
        this.advanceTurn()

        // Update game log
        if (res.log)
            this.log.push(res.log)

        return this.clientState(res)
    }

    // ---- Test functions ---- //
    _setIsProperty(player, property, value) {
        this.players[this.getPlayerIndex(player)][property] = value
    }

    // Create a card from the Cards object and give it to the given player. Only use for tests.
    _dealCard(player, cardName, reset = true) {
        if (reset)
            this.players[this.getPlayerIndex(player)].hand = [new (Cards[cardName])()]
        else
            this.players[this.getPlayerIndex(player)].hand.push(new (Cards[cardName])())
    }

    _dealPlayedCard(player, cardName) {
        this.players[this.getPlayerIndex(player)].playedCards.push(new (Cards[cardName])())
    }
}
