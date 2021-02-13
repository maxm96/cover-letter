import Component from './component'

class ClAvailableCards extends Component
{
    constructor() {
        super()

        const shadow = this.attShad()
        const container = this.createContainer('ul')

        this.availableCards = this.getAttr('available-cards').split(',')

        container.innerHTML = this.template

        this.show = this.show.bind(this)
        this.hide = this.hide.bind(this)
        this.onLiClick = this.onLiClick.bind(this)

        shadow.appendChild(container)
    }

    get template() {
        return `
        <style>
        .available-cards {
            list-style-type: none;
        }
        
        .available-card {
            padding: 2px;
            cursor: pointer;
        }
        
        .available-card:hover, .available-card.selected {
            background-color: black;
            color: white;
            border: none;
        }
        </style>
        
        <ul class="available-cards">
            ${this.availableCards
                .filter(ac => ac)
                .map(ac => `
                    <li class="available-card" data-card="${ac.toLowerCase().replace(' ', '-')}">
                        ${ac}
                    </li>`
                )
                .join('')}
        </ul>
        `
    }

    show() {
        this.availableCardsEl.style.display = 'inline-block'
    }

    hide() {
        this.availableCardsEl.style.display = 'none'
    }

    onLiClick(e) {
        e.preventDefault()

        if (e.target.classList.contains('selected')) {
            e.target.classList.remove('selected')
        } else {
            // Remove selected class from any other selected list items
            this.availableCardsListItems.forEach((acli) => {
                if (acli.classList.contains('selected'))
                    acli.classList.remove('selected')
            })

            // Set selected class on clicked list item
            e.target.classList.add('selected')
        }

        let card = e.target.dataset.card
        this.dispatchEvent(new CustomEvent('cl-available-cards:onclick', { card }))
    }

    connectedCallback() {
        this.availableCardsEl = this.shadowRoot.querySelector('.available-cards')
        this.availableCardsListItems = this.shadowRoot.querySelectorAll('.available-card')

        // Add event listeners to all list items
        this.availableCardsListItems.forEach(acli => acli.addEventListener('click', this.onLiClick))

        // Default to hidden
        this.hide()
    }
}

customElements.define('cl-available-cards', ClAvailableCards)