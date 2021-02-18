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

    handleStateChange(state) {
        switch (state.gameState) {
            case 'w':
                // Transition UI
                this.hideBoard()
                this.showLobby()

                // Reset ready board and add all players to it with an unready status
                this.lobbyEl.readyBoardEl.reset()
                this.state.players.forEach(p => this.lobbyEl.readyBoardEl.addPlayer(p.username, false))
                break
            case 'c':
                this.lobbyEl.countdownEl.setTime(5)
                this.lobbyEl.countdownEl.startCountdown()
                break
            case 'g':
                this.hideLobby()
                this.showBoard()

                if (state.playerHands) {
                    console.log(state.playerHands[this.username])
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

                this.boardEl.deckEl.setCount(state.deckCount)
                break
        }
    }

    registerComponentEvents() {
        this.lobbyEl.readyCheckboxEl.addEventListener('cl-checkbox:onclick', (e) => {
            socket.emit('ready', { ready: e.detail })
        })
    }

    registerSocketEvents() {
        const stateChangeFunc = (curState) => {
            this.state = Object.assign(this.state, curState)
            this.handleStateChange(curState)
        }

        socket.on('curstate', stateChangeFunc)
        socket.on('statechange', stateChangeFunc)

        socket.on('playerconnection', (player) => {
            this.state.players.push(player)
            this.lobbyEl.readyBoardEl.addPlayer(player.username, player.isReady)
        })

        socket.on('playerdisconnect', ({ username, state }) => {
            if (state === 'g') {
                let playerIndex = this.getPlayerIndex(this.clientState.players, username)
                if (playerIndex < 0)
                    return console.error(`playerdisconnect: No user found with username ${username}`)

                let username = this.state.players[playerIndex].username
                this.boardEl.updateOpponentStatus(username, 'Disconnected')
                this.boardEl.logEl.addLog(`${username} has disconnected`)
            } else {
                this.state.players = this.state.players.filter(p => p.username !== username)
                this.lobbyEl.readyBoardEl.removePlayer(username)
            }
        })

        socket.on('playerreconnect', ({ username }) => {
            let playerIndex = this.getPlayerIndex(this.state.players, username)
            if (playerIndex < 0)
                return console.error(`playerreconnect: No user found with username ${username}`)

            this.state.players[playerIndex].disconnected = false

            this.boardEl.updateOpponentStatus(username, 'Connected')
            this.boardEl.addLog(`${username} has reconnected`)
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
    }
}

customElements.define('cl-game', ClGame)