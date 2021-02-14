import Component from './component'
import './lobby-sub-components/cl-ready-board'

class ClLobby extends Component
{
    constructor() {
        super()

        const shadow = this.attShad()
        const container = this.createContainer()

        this.opponents = this.getAttr('opponents').split(',')

        container.innerHTML = this.template

        shadow.appendChild(container)
    }

    get template() {
        return `
        <style></style>
        
        <cl-ready-board></cl-ready-board>
        `
    }
}

customElements.define('cl-lobby', ClLobby)