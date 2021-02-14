import Component from '../component'

class ClScoreboard extends Component
{
    constructor() {
        super()

        const shadow = this.attShad()
        const container = this.createContainer()

        this.players = this.getAttr('players').split(',')
        this.scores = JSON.parse(this.getAttr('scores', '{}'))

        container.innerHTML = this.template

        this.updateScore = this.updateScore.bind(this)
        this.addPlayer = this.addPlayer.bind(this)
        this.removePlayer = this.removePlayer.bind(this)

        shadow.appendChild(container)
    }

    get template() {
        return `
        <style>
        table {
            border: 1px solid black;
            margin: 0;
            height: 100%;
            width: 100%;
            padding: 10px;
            border-collapse: collapse;
        }
        
        thead, tbody {
            text-align: left;
        }
        
        tr {
            line-height: 14px;
        }
        
        td {
            padding: 5px;
        }
        
        tbody tr:nth-of-type(odd) {
            background-color: #33363a;
            color: white;
        }
        </style>
        
        <table>
            <tbody>
                ${this.players.filter(p => p).map((p) => {
                    return `
                    <tr id="scoreboard-${p}">
                        <td id="scoreboard-username-${p}">${p}</td>
                        <td id="scoreboard-score-${p}">${this.scores[p] || 0}</td>
                    </tr>
                    `
                }).join('')}
            </tbody>
        </table>
        `
    }

    updateScore(player, score) {
        let scoreEl = this.tableEl.querySelector(`#scoreboard-score-${player}`)
        if (!scoreEl) {
            console.error(`Unable to find score element with id #scoreboard-score-${player}`)
            return
        }

        scoreEl.innerText = score
    }

    addPlayer(player, score = '0') {
        let tBody = this.tableEl.querySelector('tbody')

        // Create a row with two cells
        let row = tBody.insertRow(-1)
        let usernameCell = row.insertCell(0)
        let scoreCell = row.insertCell(1)

        // Append text nodes
        usernameCell.appendChild(document.createTextNode(player))
        scoreCell.appendChild(document.createTextNode(score))

        // Set ids
        row.id = `scoreboard-${player}`
        usernameCell.id = `scoreboard-username-${player}`
        scoreCell.id = `scoreboard-score-${player}`

        // Update the players and scores objects
        this.players.push(player)
        this.scores[player] = score
    }

    removePlayer(player) {
        let row = this.tableEl.querySelector(`#scoreboard-${player}`)
        if (!row) {
            console.error(`Unable to find scoreboard row with id #scoreboard-${player}`)
            return
        }

        this.tableEl.deleteRow(row.rowIndex)

        // Update players and scores objects
        this.players = this.players.filter(p => p !== player)
        delete this.scores[player]
    }

    connectedCallback() {
        this.tableEl = this.shadowRoot.querySelector('table')
    }
}

customElements.define('cl-scoreboard', ClScoreboard)