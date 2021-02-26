import Components from '../component'

class ClReadyBoard extends Components
{
    constructor() {
        super()

        const shadow = this.attShad()
        const container = this.createContainer()

        this.opponents = this.getAttr('opponents').split(',')
        this.readyStatuses = JSON.parse(this.getAttr('ready-statuses', '{}'))

        container.innerHTML = this.template

        this.addPlayer = this.addPlayer.bind(this)
        this.removePlayer = this.removePlayer.bind(this)
        this.updateReadyStatus = this.updateReadyStatus.bind(this)
        this.emitEvent = this.emitEvent.bind(this)

        shadow.appendChild(container)
    }

    get template() {
        return `
        <style>
        table {
            text-align: left;
            margin: 0 auto;
            min-width: 220px;
        }
        
        tr:nth-of-type(even) {
            background-color: #33363a;
            color: white;
        }
        
        td {
            padding: 5px;
        }
        </style>
        
        <table>
            <thead>
                <tr>
                    <th id="ready-board-username">Username</th>
                    <th id="ready-board-is-ready">Ready</th>
                </tr>
                <tbody>
                    ${this.opponents.filter(o => o).map((o) => {
                        let oId = this.playerId(o)
            
                        return `
                        <tr id="ready-table-row-${oId}">
                            <td id="ready-table-username-${oId}">${o}</td>
                            <td id="ready-table-ready-${oId}">${this.readyStatuses[o] ? 'Yes' : 'No'}</td>
                        </tr>
                        `
                    }).join('')}
                </tbody>
            </thead>
        </table>
        `
    }

    addPlayer(player, ready = false) {
        let tBody = this.tableEl.querySelector('tbody')
        let row = tBody.insertRow(-1)
        let usernameCell = row.insertCell(0)
        let readyCell = row.insertCell(1)

        usernameCell.appendChild(document.createTextNode(player))
        readyCell.appendChild(document.createTextNode(ready ? 'Yes' : 'No'))

        let playerId = this.playerId(player)

        row.id = `ready-table-row-${playerId}`
        usernameCell.id = `ready-table-username-${playerId}`
        readyCell.id = `ready-table-ready-${playerId}`

        this.opponents.push(player)
        this.readyStatuses[player] = ready

        this.emitEvent()
    }

    removePlayer(player) {
        let playerId = this.playerId(player)

        let row = this.tableEl.querySelector(`#ready-table-row-${playerId}`)
        if (!row) {
            console.error(`Unable to find player on ready board with id #ready-table-row-${playerId}`)
            return
        }

        this.tableEl.deleteRow(row.rowIndex)

        this.opponents = this.opponents.filter(o => o !== player)
        delete this.readyStatuses[player]
    }

    updateReadyStatus(player, ready) {
        let playerId = this.playerId(player)

        console.log(`#ready-table-ready-${playerId}`)

        let readyCell = this.tableEl.querySelector(`#ready-table-ready-${playerId}`)
        if (!readyCell) {
            console.error(`Unable to find ready cell with id #ready-table-ready-${playerId}`)
            return
        }

        readyCell.innerText = ready ? 'Yes' : 'No'

        this.readyStatuses[player] = ready

        this.emitEvent()
    }

    emitEvent() {
        if (Object.values(this.readyStatuses).every(rs => rs))
            this.dispatchEvent(new Event('cl-ready-board:all-ready'))
        else
            this.dispatchEvent(new Event('cl-ready-board:not-ready'))
    }

    playerId(player) {
        return player.toLowerCase().replace(' ', '-')
    }

    reset() {
        this.opponents = []
        this.readyStatuses = {}

        let oldBody = this.tableEl.querySelector('tbody')
        let newBody = document.createElement('tbody')

        oldBody.parentNode.replaceChild(newBody, oldBody)
    }

    connectedCallback() {
        this.tableEl = this.shadowRoot.querySelector('table')
    }
}

customElements.define('cl-ready-board', ClReadyBoard)