import Component from './component'

class ClOpponent extends Component
{
    constructor() {
        super()

        const shadow = this.attShad()
        const container = this.createContainer()

        this.name = this.getAttr('name')
        this.status = this.getAttr('status')

        // Played cards should be given as a comma delimited string (card1,card2,card3,...)
        this.playedCards = this.getAttr('played-cards').split(',')

        container.classList.add('opponent')
        container.innerHTML = this.template

        this.nameEl = this.shadowRoot.querySelector('.name')
        this.statusEl = this.shadowRoot.querySelector('.status')
        this.playedCardsEl = this.shadowRoot.querySelector('.opponent-card-list')

        shadow.appendChild(container)
    }

    get template() {
        return `
        <style>
        .opponent {
            width: 240px;
            height: 275px;
            border: 3px solid black;
            border-radius: 5px;
            padding: 4px;
            margin-left: 2px;
        }
        
        .opponent-name {
            font-size: 20px;
        }
        
        .opponent-status {
            font-size: 14px;
            float: right;
        }
        
        .opponent-card-list {
            list-style-type: none;
            overflow-y: scroll;
        }
        </style>
        
        <span class="opponent-name">${this.name}</span>
        <span class="opponent-status">${this.status}</span>
        <ul class="opponent-card-list no-scrollbar">
            ${this.playedCards.filter(pc => pc).map(pc => `<li class="played-card">${pc}</li>`).join('')}
        </ul>
        `
    }

    connectedCallback() {
        this.nameEl.innerText = this.getAttr('name')
        this.statusEl.innerText = this.getAttr('status')

        this.getAttr('played-cards').split(',').filter(pc => pc).forEach((pc) => {
            let liEl = document.createElement('li')

            liEl.classList.add('played-card')
            liEl.innerText = pc

            this.playedCardsEl.appendChild(liEl)
        })
    }
}

customElements.define('cl-opponent', ClOpponent)