const socket = io()

let clientState = {
    gameState: null,
    players: [],
}

// ---- UI functions ---- //
function addPlayerToReadyBoard(playerName, ready = false) {
    let table = document.getElementById('ready-board')
    let row = table.insertRow(-1)
    let usernameCell = row.insertCell(0)
    let readyCell = row.insertCell(1)
    let usernameText = document.createTextNode(playerName)
    let readyText = document.createTextNode(ready ? 'Yes' : 'No')

    usernameCell.appendChild(usernameText)
    readyCell.appendChild(readyText)

    // Give the new cells id's so I can easily change the text later
    usernameCell.id = `ready-table-username-${playerName}`
    readyCell.id = `ready-table-ready-${playerName}`
}

// ---- Socket events ---- //
// This is the initial message from the server
socket.on('curstate', function (curState) {
    clientState = curState
    clientState.players.forEach(p => addPlayerToReadyBoard(p.username, p.isReady))
})

socket.on('playerconnection', function (payload) {
    clientState.players.push(payload)
    addPlayerToReadyBoard(payload.username, payload.isReady)
})

socket.on('playerready', function ({ username, gameState }) {
    let playerIndex = clientState.players.findIndex(p => p.username === username)
    if (playerIndex < 0)
        return

    clientState.players[playerIndex]['isReady'] = true

    if (gameState !== clientState.gameState) {
        clientState.gameState = gameState
        // TODO: handle state transitions
    }

    // Update ready text
    document.getElementById(`ready-table-ready-${username}`).innerText = 'Yes'
})

// ---- Listeners ---- //
const readyBtn = document.getElementById('ready-btn')
readyBtn.addEventListener('click', function () {
    socket.emit('ready')
})