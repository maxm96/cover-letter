import Component from './component'

class ClDeck extends Component
{
    constructor() {
        super()

        const shadow = this.attShad()
        const container = this.createContainer()

        this.count = this.getAttr('count')

        container.classList.add('deck')
        container.innerHTML = this.template

        shadow.appendChild(container)
    }

    get template() {
        return `
        Deck: <span class="count">${this.count}</span>
        `
    }

    setCount(count) {
        this.countEl.innerText = count
    }

    connectedCallback() {
        this.countEl = this.shadowRoot.querySelector('.count')

        this.setCount(this.getAttr('count'))
    }
}

customElements.define('cl-deck', ClDeck)