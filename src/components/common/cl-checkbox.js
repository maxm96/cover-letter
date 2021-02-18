import Component from '../component'

class ClCheckbox extends Component
{
    constructor() {
        super()

        const shadow = this.attShad()
        const container = this.createContainer()

        this.label = this.getAttr('label')

        container.innerHTML = this.template

        shadow.appendChild(container)
    }

    get template() {
        return `
        <style></style>
        
        <label><input type="checkbox"> ${this.label}</label>
        `
    }

    connectedCallback() {
        this.labelEl = this.shadowRoot.querySelector('label')
        this.checkboxEl = this.shadowRoot.querySelector('input[type=checkbox]')

        this.checkboxEl.addEventListener('change', (e) => {
            this.dispatchEvent(new CustomEvent('cl-checkbox:onclick', { detail: e.target.checked }))
        })
    }
}

customElements.define('cl-checkbox', ClCheckbox)