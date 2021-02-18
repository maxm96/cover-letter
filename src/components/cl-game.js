import Component from './component'
import './cl-lobby'
import './cl-board'

class ClGame extends Component
{
    constructor() {
        super()

        const shadow = this.attShad()
        const container = this.createContainer()

        this.username = this.getAttr('username')
        this.opponents = this.getAttr('opponents')
        this.readyStatuses = this.getAttr('ready-statuses')

        container.classList.add('game')
        container.innerHTML = this.template

        this.showLobby = this.showLobby.bind(this)
        this.hideLobby = this.hideLobby.bind(this)
        this.showBoard = this.showBoard.bind(this)
        this.hideBoard = this.hideBoard.bind(this)
        this.onCountdownFinished = this.onCountdownFinished.bind(this)

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
        
        <cl-board id="cl-board"></cl-board>
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
    }
}

customElements.define('cl-game', ClGame)