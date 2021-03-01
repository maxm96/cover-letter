import Component from './component'
import './cl-lobby'
import './cl-board'

const socket = io()

class ClGame extends Component
{
    constructor() {
        super()

        const shadow = this.attShad()
        const container = this.createContainer()

        this.username = this.getAttr('username')
        this.opponents = this.getAttr('opponents')
        this.readyStatuses = this.getAttr('ready-statuses')
        this.availableCards = this.getAttr('available-cards')

        // Game state
        this.state = {
            gameState: null,
            players: [],
            hand: [],
            playerTurn: null,
            scores: null,
            availableCards: [],
            discardedCards: [],
        }
        this.selections = {
            card: null,
            victim: null,
            availableCard: null,
            discard: null
        }

        container.classList.add('game')
        container.innerHTML = this.template

        this.showLobby = this.showLobby.bind(this)
        this.hideLobby = this.hideLobby.bind(this)
        this.showBoard = this.showBoard.bind(this)
        this.hideBoard = this.hideBoard.bind(this)
        this.onCountdownFinished = this.onCountdownFinished.bind(this)
        this.getPlayerIndex = this.getPlayerIndex.bind(this)
        this.updatePlayerHand = this.updatePlayerHand.bind(this)

        shadow.appendChild(container)
    }

    get template() {
        return `
        <style>
        #cl-lobby, #cl-board {
            width: 100%;
        }
        </style>
        
        <cl-lobby 
            id="cl-lobby"
            username="${this.username}" 
            opponents="${this.opponents}" 
            ready-statuses="${this.readyStatuses}"
        ></cl-lobby>
        
        <cl-board id="cl-board" available-cards="${this.availableCards}"></cl-board>
        `
    }

    showLobby() {
        this.lobbyEl.style.display = 'inline-block'
    }

    hideLobby() {
        this.lobbyEl.style.display = 'none'
    }

    showBoard() {
        this.boardEl.style.display = 'inline-block'
    }

    hideBoard() {
        this.boardEl.style.display = 'none'
    }

    onCountdownFinished() {
        this.hideLobby()
        this.showBoard()
    }

    connectedCallback() {
        this.lobbyEl = this.shadowRoot.querySelector('#cl-lobby')
        this.boardEl = this.shadowRoot.querySelector('#cl-board')

        this.showLobby()
        this.hideBoard()

        this.lobbyEl.addEventListener('cl-lobby:countdown-finished', this.onCountdownFinished)

        this.registerSocketEvents()
        this.registerComponentEvents()
    }

    getPlayerIndex(players, username) {
        return this.state.players.findIndex(p => p.username === username)
    }

    handleStateChange(state, keepReadyBoard) {
        switch (state.gameState) {
            case 'w':
                // Transition UI
                this.hideBoard()
                this.showLobby()

                if (!keepReadyBoard) {
                    // Reset ready board and add all players to it with an unready status
                    this.lobbyEl.readyBoardEl.reset()
                    this.state.players.forEach(p => this.lobbyEl.readyBoardEl.addPlayer(p.username, false))
                }
                break
            case 'c':
                this.lobbyEl.countdownEl.setTime(5)
                this.lobbyEl.countdownEl.startCountdown()
                break
            case 'g':
                this.hideLobby()
                this.showBoard()

                if (state.playerHands) {
                    // Update user hand
                    this.state.hand = state.playerHands[this.username]
                    this.state.hand.forEach(h => this.boardEl.addCard({
                        name: h.name,
                        number: h.number,
                        count: h.count,
                        description: h.description,
                        requiresVictim: h.requiresVictim,
                        canPlayAgainstSelf: h.canPlayAgainstSelf
                    }))
                }

                this.state.players.filter(p => p.username !== this.username).forEach((p) => {
                    this.boardEl.addOpponent({
                        name: p.username,
                        status: p.disconnected ? 'Disconnected' : 'Connected',
                        playedCards: p.playedCards
                    })
                })

                this.boardEl.deckEl.setCount(state.deckCount)
                break
        }
    }

    handleWin(winner) {

    }

    /**
     * This is called after a hand is played. Updates the current state with what we got from the server.
     * @param {array} newPlayers
     */
    updatePlayers(newPlayers) {
        newPlayers.forEach((p) => {
            let playerIndex = this.getPlayerIndex(this.state.players, p.username)
            if (playerIndex < 0) {
                console.error(`updatePlayers: Unable to find user ${p.username}`)
                return
            }

            let isOpponent = p.username !== this.username

            this.state.players[playerIndex] = this.updateIsOut(p, this.state.players[playerIndex], isOpponent)
            this.state.players[playerIndex] = this.updateIsProtected(p, this.state.players[playerIndex], isOpponent)

            if (isOpponent && p.playedCards) {
                this.state.players[playerIndex].playedCards = p.playedCards
                this.boardEl.updateOpponentPlayedCards(
                    this.state.players[playerIndex].username,
                    this.state.players[playerIndex].playedCards
                )
            }
        })
    }

    updatePlayerTurn(newPlayerTurn) {
        this.state.playerTurn = newPlayerTurn

        if (this.username === newPlayerTurn) {
            this.boardEl.removeCurrentTurn()
            this.boardEl.setOpponentDragListeners()
            this.boardEl.setCardDragListeners()
        } else {
            this.boardEl.setCurrentTurn(newPlayerTurn)
            this.boardEl.removeOpponentDragListeners()
            this.boardEl.removeCardDragListeners()
        }
    }

    /**
     * Tells the boardEl to update the given player's classList and then logs a message. Does nothing if the newPlayer
     * and oldPlayer isOut properties are the same.
     * @param {object} newPlayer
     * @param {object} oldPlayer
     * @param {boolean} isOpponent
     * @return {object}
     */
    updateIsOut(newPlayer, oldPlayer, isOpponent) {
        if (newPlayer.isOut === oldPlayer.isOut) return newPlayer

        if (newPlayer.isOut) {
            if (isOpponent) {
                this.boardEl.updateOpponentIsOut(newPlayer.username, newPlayer.isOut)
                this.boardEl.logEl.addLog(`${newPlayer.username} is out.`)
            } else {
                this.boardEl.logEl.addLog('You are out.')
            }
        }

        return newPlayer
    }

    /**
     * Tells the boardEl to update the given player's classList then logs a message. Does nothing if the newPlayer
     * and oldPlayer isProtected are the same.
     * @param {object} newPlayer
     * @param {object} oldPlayer
     * @param {boolean} isOpponent
     * @return {object}
     */
    updateIsProtected(newPlayer, oldPlayer, isOpponent) {
        if (newPlayer.isProtected === oldPlayer.isProtected) return newPlayer

        this.boardEl.updateOpponentIsProtected(newPlayer.username, newPlayer.isProtected)

        if (newPlayer.isProtected) {
            if (isOpponent)
                this.boardEl.logEl.addLog(`You are protected until round ${newPlayer.isProtected}.`)
            else
                this.boardEl.logEl.addLog(`${newPlayer.username} is protected until round ${newPlayer.isProtected}.`)
        }

        return newPlayer
    }

    updatePlayerHand(newHand) {
        // Let the board update before updating state
        this.boardEl.updatePlayerHand(newHand, this.state.playerHands[this.username])
        this.state.playerHands[this.username] = newHand
    }

    registerComponentEvents() {
        // Emit the current ready status to the server on ready box click
        this.lobbyEl.readyCheckboxEl.addEventListener('cl-checkbox:onclick', (e) => {
            socket.emit('ready', { ready: e.detail })
        })

        // Emit playhand event to server on a card drop
        this.boardEl.addEventListener('cl-board:ondrop', (e) => {
            socket.emit('playhand', {
                player: this.username, // We can just assume that the player is this client
                card: e.detail.cardName,
                victim: e.detail.victim,
                guess: e.detail.guess || null,
                discard: e.detail.discard || false
            })
        })
    }

    registerSocketEvents() {
        // Set the local state and do
        const stateChangeFunc = (curState) => {
            let stateChange = curState.gameState !== this.state.gameState
            let countdownToWaiting = curState.gameState === 'w' && this.state.gameState === 'c'

            this.state = Object.assign(this.state, curState)

            // Update the logs
            // TODO: for future, make all logs on server so we get a more accurate log here
            if (this.state.log && this.state.log.length)
                this.state.log.forEach(l => this.boardEl.logEl.addLog(l))

            // Only handle a state change if the state has actually changed
            if (stateChange)
                this.handleStateChange(curState, countdownToWaiting)

            if (this.state.gameState !== 'g') return

            if (this.username === curState.playerTurn) {
                this.boardEl.setCardDragListeners()
                this.boardEl.setOpponentDragListeners()
            } else {
                this.boardEl.setCurrentTurn(curState.playerTurn)
            }
        }

        socket.on('curstate', stateChangeFunc)
        socket.on('statechange', stateChangeFunc)

        socket.on('playerconnection', (player) => {
            this.state.players.push(player)
            this.lobbyEl.readyBoardEl.addPlayer(player.username, player.isReady)
        })

        socket.on('playerdisconnect', ({ username, state }) => {
            // Set player disconnected if in gameplay state
            if (state === 'g') {
                let playerIndex = this.getPlayerIndex(this.state.players, username)
                if (playerIndex < 0)
                    return console.error(`playerdisconnect: No user found with username ${username}`)

                this.boardEl.updateOpponentStatus(username, 'Disconnected')
                this.boardEl.logEl.addLog(`${username} has disconnected`)
            }
            // Otherwise just remove the player
            else {
                this.state.players = this.state.players.filter(p => p.username !== username)
                this.lobbyEl.readyBoardEl.removePlayer(username)
            }
        })

        socket.on('playerreconnect', ({ username }) => {
            if (username === this.username) return

            let playerIndex = this.getPlayerIndex(this.state.players, username)
            if (playerIndex < 0)
                return console.error(`playerreconnect: No user found with username ${username}`)

            this.state.players[playerIndex].disconnected = false

            this.boardEl.updateOpponentStatus(username, 'Connected')
            this.boardEl.logEl.addLog(`${username} has reconnected`)
        })

        socket.on('playerready', ({ username, ready, gameState }) => {
            let playerIndex = this.getPlayerIndex(this.state.players, username)
            if (playerIndex < 0)
                return console.error(`playerready: No user found with username ${username}`)

            this.state.players[playerIndex].ready = ready
            this.lobbyEl.readyBoardEl.updateReadyStatus(username, ready)

            if (this.state.gameState !== gameState) {
                this.state.gameState = gameState
                // Handle state change
            }
        })

        socket.on('handplayed', ({ playerHands, playerTurn, players,
                                     scores, winner, log, victimHand,
                                     deckCount, discardedCards, roundTime }) => {
            if (log) this.boardEl.logEl.addLog(log[log.length - 1])

            if (winner) this.handleWin(winner)

            if (players) this.updatePlayers(players)

            if (playerHands && playerHands[this.username]) this.updatePlayerHand(playerHands[this.username])

            if (playerTurn) this.updatePlayerTurn(playerTurn)
        })
    }
}

customElements.define('cl-game', ClGame)