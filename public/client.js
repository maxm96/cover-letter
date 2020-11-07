const socket = io()

// This is the user's username
const clientUsername = document.querySelector('#client_username').value

let clientState = {
    gameState: null,
    players: [],
    hand: [],
    playerTurn: null,
    scores: null
}

// Keep track of the countdown interval
let countdownHandle = null

// ---- Utils ---- //
function handleStateChange(state, options) {
    // Just clear the countdown interval on each state change
    if (countdownHandle !== null) {
        clearInterval(countdownHandle)
        countdownHandle = null
        hideCountdown()
    }

    switch (state) {
        case 'w':
            // Transition to waiting UI
            waitingTransition(clientState)
            break
        case 'c':
            countdownHandle = startCountdown()
            break
        case 'g':
            // Get our first dealt hand
            if (options.playerHands) {
                clientState.hand = options.playerHands[clientUsername]
                clientState.hand.forEach(card => appendCardToHand({
                    number: card.number,
                    name: card.name,
                    description: card.description
                }))
            }

            // Get the player whose turn it is
            if (options.playerTurn)
                clientState.playerTurn = options.playerTurn

            // Set deck count
            if (options.deckCount)
                updateDeckCount(options.deckCount)

            // Reset the scores object
            clientState.scores = {}
            clientState.players.forEach(p => clientState.scores[p.username] = 0)

            // Transition the UI
            gameplayTransition(clientState, clientUsername)
            break
        default:
            console.log(`Unknown state change: ${state}`)
    }
}

function updateHand(newHand) {
    updateHandUI(newHand)
    clientState.hand = newHand
}

function updatePlayerTurn(newPlayerTurn) {
    updatePlayerTurnUI(newPlayerTurn)
    clientState.playerTurn = newPlayerTurn
}

function updatePlayers(players) {
    clientState.players.forEach((p) => {

    })
}

function updateScores(scores) {

}

function handleWin(winner) {

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

socket.on('playerdisconnect', function ({ username }) {
    clientState.players = clientState.players.filter(p => p.username !== username)
    removePlayerFromReadyBoard(username)
})

socket.on('playerready', function ({ username, ready, gameState }) {
    let playerIndex = clientState.players.findIndex(p => p.username === username)
    if (playerIndex < 0)
        return

    clientState.players[playerIndex]['isReady'] = ready

    // Update ready text
    document.getElementById(`ready-table-ready-${username}`).innerText = ready ? 'Yes' : 'No'

    if (gameState !== clientState.gameState) {
        clientState.gameState = gameState
        handleStateChange(clientState.gameState)
    }
})

socket.on('statechange', function ({ state, playerHands, playerTurn, deckCount }) {
    handleStateChange(state, {
        playerHands: playerHands,
        playerTurn: playerTurn,
        deckCount: deckCount
    })
})

socket.on('handplayed', function ({ state, playerHands, playerTurn, players, scores, winner, log, victimCard }) {
    if (log)
        logMessage(log)

    if (winner)
        handleWin(winner)

    if (state !== clientState.gameState)
        handleStateChange(state, {
            playerHands: playerHands,
            playerTurn: playerTurn
        })
    else {
        updatePlayers(players)
        updateScores(scores)
        updateHand(playerHands[clientUsername])
        updatePlayerTurn(playerTurn)
    }

    if (victimCard)
        logMessage(`${victimCard.username} has the card ${victimCard}.`)
})

socket.on('handplayedfailed', function ({ message }) {
    flashErrorMessage(message)
})

socket.on('connectionfailed', function ({ message }) {
    showErrorMessage(message)
    socket.disconnect()
})

socket.on('readyfailed', function ({ message }) {
    flashErrorMessage(message)
})

// ---- Listeners ---- //
const readyBtn = document.getElementById('ready-btn')
readyBtn.addEventListener('click', function (e) {
    socket.emit('ready', { ready: e.target.checked })
})