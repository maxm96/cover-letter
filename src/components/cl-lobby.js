import Component from './component'
import './lobby-sub-components/cl-ready-board'
import './common/cl-checkbox'
import './common/cl-countdown'

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

        this.hideCountdown = this.hideCountdown.bind(this)
        this.showCountdown = this.showCountdown.bind(this)
        this.onAllReady = this.onAllReady.bind(this)
        this.onNotReady = this.onNotReady.bind(this)
        this.onCheckboxClick = this.onCheckboxClick.bind(this)
        this.onCountdownFinished = this.onCountdownFinished.bind(this)

        shadow.appendChild(container)
    }

    get template() {
        return `
        <style>
        #lobby {
            text-align: center;
            width: 100%;
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

    onAllReady() {
        this.countdownEl.setTime(5)
        this.showCountdown()
        this.countdownEl.startCountdown()
    }

    onNotReady() {
        this.countdownEl.stopCountdown()
        this.hideCountdown()
    }

    onCheckboxClick(e) {
        this.readyBoardEl.updateReadyStatus(this.username, e.detail)
    }

    onCountdownFinished() {
        this.dispatchEvent(new Event('cl-lobby:countdown-finished'))
    }

    connectedCallback() {
        this.readyBoardEl = this.shadowRoot.querySelector('#ready-board')
        this.readyCheckboxEl = this.shadowRoot.querySelector('#ready-checkbox')
        this.countdownEl = this.shadowRoot.querySelector('#countdown')

        this.hideCountdown()

        this.readyBoardEl.addEventListener('cl-ready-board:all-ready', this.onAllReady)
        this.readyBoardEl.addEventListener('cl-ready-board:not-ready', this.onNotReady)

        this.readyCheckboxEl.addEventListener('cl-checkbox:onclick', this.onCheckboxClick)

        this.countdownEl.addEventListener('countdownfinished', this.onCountdownFinished)
    }
}

customElements.define('cl-lobby', ClLobby)