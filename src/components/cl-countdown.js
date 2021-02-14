import Component from './component'

class ClCountdown extends Component
{
    constructor() {
        super()

        const shadow = this.attShad()
        const container = this.createContainer()

        this.time = this.getAttr('time')
        this.countdownHandle = null

        container.classList.add('countdown')
        container.innerHTML = this.template


        this.setTime = this.setTime.bind(this)
        this.startCountdown = this.startCountdown.bind(this)
        this.stopCountdown = this.stopCountdown.bind(this)

        shadow.appendChild(container)
    }

    get template() {
        return `
        <style>
        .countdown {
            text-align: center;
            margin-top: 15px;
            font-size: 1.8em;
        }
        
        .time {
            font-size: 26px;
            padding: 10px;
        }
        </style>
        
        <span class="time">${this.time}</span>
        `
    }

    setTime(time) {
        this.time = time
        this.timeEl.innerText = time
    }

    startCountdown() {
        if (this.countdownHandle !== null)
            return

        this.countdownHandle = setInterval(() => {
            if (--this.time > -1) {
                this.timeEl.innerText = this.time
            } else {
                this.stopCountdown()

                // Emit an event to let parent know that countdown has finished
                this.dispatchEvent(new Event('countdownfinished'))
            }
        }, 1000)
    }

    stopCountdown() {
        clearInterval(this.countdownHandle)
        this.countdownHandle = null
    }

    connectedCallback() {
        this.timeEl = this.shadowRoot.querySelector('.time')

        this.setTime(this.getAttr('time'))
    }
}

customElements.define('cl-countdown', ClCountdown)