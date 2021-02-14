import Component from './component'

class ClButton extends Component
{
    constructor() {
        super()

        const shadow = this.attShad()
        const container = this.createContainer('button')

        this.text = this.getAttr('text')

        this.show = this.show.bind(this)
        this.hide = this.hide.bind(this)
        this.onClick = this.onClick.bind(this)

        shadow.appendChild(container)
    }

    show() {
        this.buttonEl.style.display = 'inline-block'
    }

    hide() {
        this.buttonEl.style.display = 'none'
    }

    onClick(e) {
        e.preventDefault()
        this.dispatchEvent(new Event('cl-button:onclick'))
    }

    connectedCallback() {
        this.buttonEl = this.shadowRoot.querySelector('button')

        this.buttonEl.innerText = this.getAttr('text')
        this.buttonEl.addEventListener('click', this.onClick)

        // Default button to hidden
        this.hide()
    }
}

customElements.define('cl-button', ClButton)