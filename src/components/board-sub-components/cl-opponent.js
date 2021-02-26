import Component from '../component'

class ClOpponent extends Component
{
    constructor() {
        super()

        const shadow = this.attShad()
        const container = this.createContainer()

        this.name = this.getAttr('name')
        this.status = this.getAttr('status')

        // Played cards should be given as a comma delimited string (card1,card2,card3,...)
        this.playedCards = this.getAttr('played-cards').split(',').filter(pc => pc && pc.length)

        container.classList.add('opponent')
        container.innerHTML = this.template

        this.updateStatus = this.updateStatus.bind(this)
        this.updatePlayedCards = this.updatePlayedCards.bind(this)
        this.playedCardsListItems = this.playedCardsListItems.bind(this)

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

        .selected {
            background-color: black;
            color: white;
        }
        
        .selectable {
            cursor: pointer;
        }
        
        .out {
            cursor: not-allowed;
            border: 3px solid red;
        }
        
        .protected {
            cursor: not-allowed;
            background-color: #88e2de;
            border: 3px solid lightblue;
        }
        </style>
        
        <span class="opponent-name">${this.name}</span>
        <span class="opponent-status">${this.status}</span>
        <ul class="opponent-card-list no-scrollbar">
            ${this.playedCardsListItems()}
        </ul>
        `
    }

    updateStatus(status) {
        this.statusEl.innerText = status
    }

    updatePlayedCards(playedCards) {
        this.playedCards = playedCards.filter(pc => pc && pc.length)
        this.playedCardsEl.innerHTML = this.playedCardsListItems()
    }

    playedCardsListItems() {
        let listItems = this.playedCards.map(pc => `<li class="played-card">${pc}</li>`).join('')
        return listItems && listItems.length ? listItems : '<li class="played-card">No cards played yet</li>'
    }

    connectedCallback() {
        this.nameEl = this.shadowRoot.querySelector('.opponent-name')
        this.statusEl = this.shadowRoot.querySelector('.opponent-status')
        this.playedCardsEl = this.shadowRoot.querySelector('.opponent-card-list')

        this.nameEl.innerText = this.getAttr('name')
        this.statusEl.innerText = this.getAttr('status')

        this.updatePlayedCards(this.playedCards)
    }
}

customElements.define('cl-opponent', ClOpponent)