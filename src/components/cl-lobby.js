import Component from './component'
import './lobby-sub-components/cl-ready-board'
import './lobby-sub-components/cl-checkbox'

class ClLobby extends Component
{
    constructor() {
        super()

        const shadow = this.attShad()
        const container = this.createContainer()

        this.opponents = this.getAttr('opponents').split(',')

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
        
        <cl-ready-board id="ready-board"></cl-ready-board>
        <cl-checkbox id="ready-checkbox" label="Ready"></cl-checkbox>
        `
    }

    connectedCallback() {
        this.readyBoardEl = this.shadowRoot.querySelector('#ready-board')
        this.readyCheckboxEl = this.shadowRoot.querySelector('#ready-checkbox')

        this.readyCheckboxEl.addEventListener('cl-checkbox:onclick', (e) => {
            console.log('cl-checkbox:onclick', e.checked)
        })
    }
}

customElements.define('cl-lobby', ClLobby)