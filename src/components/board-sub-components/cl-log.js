import Component from '../component'

class ClLog extends Component
{
    constructor() {
        super()

        const shadow = this.attShad()
        const container = this.createContainer()

        this.logs = this.getAttr('logs').split(',')

        container.innerHTML = this.template

        this.addLog = this.addLog.bind(this)

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
        
        tbody {
            text-align: left;
        }
        
        tr {
            line-height: 12px;
        }
        
        td {
            padding: 2px;
        }
        
        tbody tr:nth-of-type(odd) {
            background-color: #b0abab;
        }
        </style>
        
        <table>
            <tbody>
                ${this.logs.filter(l => l).map((l) => {
                    return `
                    <tr class="log-item">
                        <td>${l}</td>
                    </tr>
                    `
        }).join('')}
            </tbody>
        </table>
        `
    }

    addLog(log) {
        let tBody = this.tableEl.querySelector('tbody')

        let row = tBody.insertRow(-1)
        let cell = row.insertCell(0)

        cell.appendChild(document.createTextNode(log))

        row.classList.add('log-item')

        this.logs.push(log)
    }

    connectedCallback() {
        this.tableEl = this.shadowRoot.querySelector('table')
    }
}

customElements.define('cl-log', ClLog)