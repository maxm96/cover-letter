import Component from './component'
import './board-sub-components/cl-card'
import './board-sub-components/cl-opponent'
import './common/cl-countdown'
import './common/cl-button'
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
        this.updateOpponentPlayedCards = this.updateOpponentPlayedCards.bind(this)
        this.updatePlayerHand = this.updatePlayerHand.bind(this)
        this.canAddCardToHand = this.canAddCardToHand.bind(this)

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
                </cl-available-cards>
            </div>
            <div id="user-cards"></div>
        </div>
        `
    }

    addOpponent({ name, status, playedCards }) {
        const oppEl = document.createElement('cl-opponent')

        if (name) oppEl.setAttribute('name', name)
        if (status) oppEl.setAttribute('status', status)
        if (playedCards) oppEl.setAttribute('played-cards', playedCards.map(pc => pc.name).join(','))

        oppEl.id = `opponent-${name}`

        // Make the opponent a droppable zone
        oppEl.addEventListener('dragover', (e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'link'
        })
        oppEl.addEventListener('drop', (e) => {
            let cardName = e.dataTransfer.getData('text/plain')

            this.dispatchEvent(new CustomEvent('cl-board:ondrop', {
                detail: {
                    cardName: cardName,
                    victim: name
                }
            }))
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
        // @TODO: figure out why this doesn't work in Firefox
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

    updateOpponentStatus(opponent, status) {
        this.opponentsEl.querySelector(`#opponent-${opponent}`).updateStatus(status)
    }

    updateOpponentIsOut(opponent, isOut) {
        let opp = this.opponentsEl.querySelector(`#opponent-${opponent}`)

        if (isOut) opp.classList.add('out')
        else opp.classList.remove('out')
    }

    updateOpponentIsProtected(opponent, isProtected) {
        let opp = this.opponentsEl.querySelector(`#opponent-${opponent}`)

        if (isProtected) opp.classList.add('protected')
        else opp.classList.remove('protected')
    }

    cardClass(cardName) {
        return cardName.toLowerCase().replace(' ', '-')
    }

    updateOpponentPlayedCards(opponent, playedCards) {
        let opp = this.opponentsEl.querySelector(`#opponent-${opponent}`)
        if (!opp) {
            console.error(`No opponent found with selector #opponent-${opponent}`)
            return
        }

        // Child components should only have to deal with the names
        opp.updatePlayedCards(playedCards.map(pc => pc.name))
    }

    updatePlayerHand(newHand, oldHand) {
        let newHandNames = newHand.map(nh => nh.name)
        let oldHandNames = oldHand.map(nh => nh.name)
        let handDiff = oldHandNames.filter(ohn => !newHandNames.includes(ohn))

        // There is a case where calculating the difference in this way is incorrect i.e. when
        // the old hand contains two of some card and the new hand contains one of the same card
        // (old: Wagie, Wagie ; new: Wagie). This will calculate an empty difference. So, handle
        // such a case.
        if (!handDiff.length && oldHandNames.length > newHandNames.length
            && oldHandNames.every(n => newHandNames.includes(n)))
            handDiff = [oldHandNames[0]]

        // Remove the diff
        handDiff.forEach(hd => this.removeCard(hd))

        // I have no idea what this does anymore -- but it just werks
        newHand.forEach((nh) => {
            let cardCount = newHand.reduce((acc, cur) => cur.number === nh.number ? acc += 1 : acc, 0)
            if (this.canAddCardToHand(nh.name, cardCount)) {
                this.addCard({
                    name: nh.name,
                    number: nh.number,
                    count: nh.count,
                    picture: nh.picture,
                    description: nh.description,
                    requiresVictim: nh.requiresVictim,
                    canPlayAgainstSelf: nh.canPlayAgainstSelf
                })
            }
        })
    }

    canAddCardToHand(cardName, cardCount) {
        return this.userCardsEl.querySelectorAll('.' + this.cardClass(cardName)).length < cardCount
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