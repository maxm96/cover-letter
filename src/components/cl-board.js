import Component from './component'
import './board-sub-components/cl-card'
import './board-sub-components/cl-opponent'
import './board-sub-components/cl-countdown'
import './board-sub-components/cl-button'
import './board-sub-components/cl-available-cards'
import './board-sub-components/cl-deck'
import './board-sub-components/cl-scoreboard'
import './board-sub-components/cl-log'

class ClBoard extends Component
{
    constructor() {
        super()

        const shadow = this.attShad()
        const container = this.createContainer()

        this.avaialableCards = this.getAttr('available-cards').split(',')

        container.classList.add('board')
        container.innerHTML = this.template

        this.addOpponent = this.addOpponent.bind(this)
        this.addCard = this.addCard.bind(this)
        this.removeCard = this.removeCard.bind(this)

        shadow.appendChild(container)
    }

    get template() {
        return `
        <style>
        #top-bar {
            display: flex;
            justify-content: space-between;
            width: 100%;
            height: 250px;
        }
        
        #scoreboard {
            flex: 1;
        }
        
        #log {
            flex: 2;
        }
        
        #scoreboard, #log {
            overflow-y: scroll;
        }
        
        #opponents, #user-cards {
            display: flex;
            width: 100%;
            height: 300px;
        }
        
        #user-cards {
            flex-direction: row-reverse;
        }
        </style>
        
        <div id="top-bar">
            <cl-scoreboard id="scoreboard"></cl-scoreboard>
            <cl-log id="log"></cl-log>
        </div>
        
        <div id="notifications">
            <cl-countdown time="60"></cl-countdown>
        </div>
        
        <div id="opponents"></div>
        
        <div id="user-area">
            <div id="left-bar">
                <cl-deck id="deck" count="${this.deckCount}"></cl-deck>
                <cl-button id="discard-btn" text="Discard"></cl-button>
                <cl-button id="against-self-btn" text="Apply to self"></cl-button>
                <cl-available-cards id="available-cards" available-cards="${this.avaialableCards.join(',')}"
            </div>
            <div id="user-cards"></div>
        </div>
        `
    }

    addOpponent({ name, status, playedCards }) {
        const oppEl = document.createElement('cl-opponent')

        if (name) oppEl.setAttribute('name', name)
        if (status) oppEl.setAttribute('status', status)
        if (playedCards) oppEl.setAttribute('played-cards', playedCards.join(','))

        // Make the opponent a droppable zone
        oppEl.addEventListener('dragover', (e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'link'
        })
        oppEl.addEventListener('drop', (e) => {
            let cardName = e.dataTransfer.getData('text/plain')
            this.removeCard(cardName)
            console.log(cardName)
        })

        this.opponentsEl.appendChild(oppEl)
    }

    addCard({ name, number, count, picture, description, requiresVictim, canPlayAgainstSelf }) {
        const cardEl = document.createElement('cl-card')

        if (name) cardEl.setAttribute('name', name)
        if (number) cardEl.setAttribute('number', number)
        if (count) cardEl.setAttribute('count', count)
        if (picture) cardEl.setAttribute('picture', picture)
        if (description) cardEl.setAttribute('description', description)
        if (requiresVictim) cardEl.setAttribute('requires-victim', requiresVictim)
        if (canPlayAgainstSelf) cardEl.setAttribute('can-play-against-self', canPlayAgainstSelf)

        cardEl.classList.add(this.cardClass(name))

        // Make the card draggable
        cardEl.setAttribute('draggable', 'true')
        cardEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', name)
            e.dataTransfer.dropEffect = 'link'
        })

        this.userCardsEl.appendChild(cardEl)
    }

    removeCard(cardName) {
        let cardClass = this.cardClass(cardName)
        let cardEl = this.userCardsEl.querySelector(`.${cardClass}`)

        if (!cardEl) {
            console.error(`removeCard: Unable to find card with class ${cardClass}`)
            return
        }

        cardEl.parentNode.removeChild(cardEl)
    }

    cardClass(cardName) {
        return cardName.toLowerCase().replace(' ', '-')
    }

    connectedCallback() {
        this.opponentsEl = this.shadowRoot.querySelector('#opponents')
        this.userCardsEl = this.shadowRoot.querySelector('#user-cards')
        this.discardBtnEl = this.shadowRoot.querySelector('#discard-btn')
        this.againstSelfBtnEl = this.shadowRoot.querySelector('#against-self-btn')
        this.availableCardsEl = this.shadowRoot.querySelector('#available-cards')
        this.deckEl = this.shadowRoot.querySelector('#deck')
        this.scoreboardEl = this.shadowRoot.querySelector('#scoreboard')
        this.logEl = this.shadowRoot.querySelector('#log')

        this.discardBtnEl.addEventListener('cl-button:onclick', (e) => {
            console.log('discard button click', e)
        })

        this.againstSelfBtnEl.addEventListener('cl-button:onclick', (e) => {
            console.log('against self button click', e)
        })

        this.availableCardsEl.addEventListener('cl-available-cards:onclick', (e) => {
            console.log('available cards click', e)
        })
    }
}

customElements.define('cl-board', ClBoard)