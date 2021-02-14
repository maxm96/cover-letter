import Component from './component'
import './lobby-sub-components/cl-ready-board'
import './lobby-sub-components/cl-checkbox'
import './cl-countdown'

class ClLobby extends Component
{
    constructor() {
        super()

        const shadow = this.attShad()
        const container = this.createContainer()

        this.username = this.getAttr('username')
        this.opponents = this.getAttr('opponents')
        this.readyStatuses = this.getAttr('ready-statuses')

        container.id = 'lobby'
        container.innerHTML = this.template

        shadow.appendChild(container)
    }

    get template() {
        return `
        <style>
        #lobby {
            text-align: center;
        }
        </style>
        
        <cl-ready-board id="ready-board" opponents="${this.opponents}" ready-statuses="${this.readyStatuses}">
        </cl-ready-board>
        
        <cl-checkbox id="ready-checkbox" label="Ready"></cl-checkbox>
        <cl-countdown id="countdown" time="5"></cl-countdown>
        `
    }

    hideCountdown() {
        this.countdownEl.style.display = 'none'
    }

    showCountdown() {
        this.countdownEl.style.display = 'inline-block'
    }

    connectedCallback() {
        this.readyBoardEl = this.shadowRoot.querySelector('#ready-board')
        this.readyCheckboxEl = this.shadowRoot.querySelector('#ready-checkbox')
        this.countdownEl = this.shadowRoot.querySelector('#countdown')

        this.hideCountdown()

        this.readyBoardEl.addEventListener('cl-ready-board:all-ready', () => {
            this.countdownEl.setTime(5)
            this.showCountdown()
            this.countdownEl.startCountdown()
        })
        this.readyBoardEl.addEventListener('cl-ready-board:not-ready', () => {
            this.countdownEl.stopCountdown()
            this.hideCountdown()
        })

        this.readyCheckboxEl.addEventListener('cl-checkbox:onclick', (e) => {
            this.readyBoardEl.updateReadyStatus(this.username, e.checked)
        })

        this.countdownEl.addEventListener('countdownfinished', (e) => {
            console.log('countdownfinished', e)
        })
    }
}

customElements.define('cl-lobby', ClLobby)