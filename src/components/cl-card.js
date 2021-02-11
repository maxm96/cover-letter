import Component from './component'

class ClCard extends Component
{
    constructor() {
        super()

        const shadow = this.attShad()
        const container = this.createContainer()

        const name = this.getAttr('name')
        const description = this.getAttr('description')
        const count = this.getAttr('count')
        const number = this.getAttr('number')
        const requiresVictim = this.getAttr('requires-victim')
        const canPlayAgainstSelf = this.getAttr('can-play-against-self')
        const picture = this.getAttr('picture')

        container.classList.add('card')
        container.innerHTML = `
        <style>
        .card {
            width: 240px;
            height: 275px;
            border: 1px solid grey;
            border-radius: 5px;
            padding: 6px;
            margin-left: 2px;
            animation: fadein 1s;
        }
        
        .card-title {
            margin-left: 10px;
        }
        
        .card-picture {
            margin-top: 10px;
            margin-bottom: 10px;
        }
        
        @media only screen and (min-width: 360px) and (max-width: 767px) {
            .card {
                font-size: 14px;
            }
        }
        </style>
        
        <span class="card-number">${number}</span>
        <span class="card-name">${name}</span>
        <span class="card-count">${count}</span>
        <img class="card-picture" src="${picture}">
        <p class="card-description">${description}</p>
        <input class="requires-victim" value="${requiresVictim}" hidden="true">
        <input class="against-self" value="${canPlayAgainstSelf}" hidden="true">
        `

        // Get a reference to each element
        this.numberEl = this.shadowRoot.querySelector('.card-number')
        this.nameEl = this.shadowRoot.querySelector('.card-name')
        this.countEl = this.shadowRoot.querySelector('.card-count')
        this.pictureEl = this.shadowRoot.querySelector('.card-picture')
        this.descriptionEl = this.shadowRoot.querySelector('.card-description')
        this.requiresVictimEl = this.shadowRoot.querySelector('.requires-victim')
        this.canPlayAgainstSelfEl = this.shadowRoot.querySelector('.against-self')

        shadow.appendChild(container)
    }

    connectedCallback() {
        this.numberEl.innerText = this.getAttr('number')
        this.nameEl.innerText = this.getAttr('name')
        this.countEl.innerText = this.getAttr('count')
        this.pictureEl.innerText = this.getAttr('picture')
        this.descriptionEl.innerText = this.getAttr('description')
        this.requiresVictimEl.value = this.getAttr('requires-victim')
        this.canPlayAgainstSelfEl.value = this.getAttr('can-play-against-self')
    }
}

customElements.define('cl-card', ClCard)