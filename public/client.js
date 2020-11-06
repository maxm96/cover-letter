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

// ---- UI functions ---- //
function addPlayerToReadyBoard(playerName, ready = false) {
    let table = document.getElementById('ready-board').getElementsByTagName('tbody')[0]
    let row = table.insertRow(-1)
    let usernameCell = row.insertCell(0)
    let readyCell = row.insertCell(1)
    let usernameText = document.createTextNode(playerName)
    let readyText = document.createTextNode(ready ? 'Yes' : 'No')

    usernameCell.appendChild(usernameText)
    readyCell.appendChild(readyText)

    // Give the new cells id's so I can easily change the text later
    row.id = `ready-table-row-${playerName}`
    usernameCell.id = `ready-table-username-${playerName}`
    readyCell.id = `ready-table-ready-${playerName}`
}

function removePlayerFromReadyBoard(playerName) {
    let row = document.getElementById(`ready-table-row-${playerName}`)
    document.getElementById('ready-board').deleteRow(row.rowIndex)
}

// Used to show an error message and hide the rest of the page (i.e. for connection failure)
function showErrorMessage(message) {
    let errorMessage = document.getElementById('error-message')

    errorMessage.innerText = message
    errorMessage.style.display = 'block'

    // Hide lobby and game board UI
    let lobby = document.getElementById('lobby')
    let gameBoard = document.getElementById('game-board')

    lobby.style.display = 'none'
    gameBoard.style.display = 'none'
}

// Flashes a message on the screen for a failed action (i.e. ready failed)
function flashErrorMessage(message) {
    let errorMessage = document.getElementById('error-message')

    errorMessage.innerText = message
    errorMessage.style.display = 'block'

    // Hide message after 5 seconds
    setTimeout(() => {
        errorMessage.innerText = ''
        errorMessage.style.display = 'none'
    }, 5000)
}

// Hide lobby UI, show game board UI
function gameplayTransition() {
    let lobby = document.getElementById('lobby')
    lobby.style.display = 'none'

    let gameBoard = document.getElementById('game-board')
    gameBoard.style.display = 'block'
}

// Hide game board UI, show lobby UI
function waitingTransition() {
    let lobby = document.getElementById('lobby')

    // Transitioning from a game state to waiting, show table and update ready statuses
    if (lobby.style.display === 'none') {
        lobby.style.display = 'block'

        // Reset ready table tbody
        let oldBody = document.querySelector('tbody')
        let newBody = document.createElement('tbody')
        oldBody.parentNode.replaceChild(newBody, oldBody)

        // Reset ready statuses
        clientState.players = clientState.players.map(p => ({ username: p.username, isReady: false }))

        // Repopulate table
        clientState.players.forEach(p => addPlayerToReadyBoard(p.username, p.isReady))
    }

    // Just hide the game board
    document.getElementById('game-board').style.display = 'none'
}

function startCountdown() {
    let countdown = document.getElementById('countdown')
    let count = 5

    countdown.style.display = 'block'
    countdown.innerText = String(count)

    // Update the countdown every second with an decremented count
    return setInterval(() => {
        if (--count < 0)
            return

        countdown.innerText = String(count)
    }, 1000)
}

function hideCountdown() {
    document.getElementById('countdown').style.display = 'none'
}

/**
 * Clear all cards from hand.
 */
function resetHand() {
    document.getElementById('user-cards').innerHTML = ''
}

/**
 * Remove a card from the user's hand. Removes a card with the same number that is given.
 * @param {string|number} cardNumber
 */
function removeCardFromHand(cardNumber) {
    let userCards = document.getElementById('user-cards')
    let card = userCards.getElementsByClassName(`card-${cardNumber}`)[0]

    if (!card)
        return console.log(`card-${cardNumber} child class not found in user-cards`)

    userCards.removeChild(card)
}

/**
 * Append a new card to the user's hand. Clones the card template and appends to user-cards.
 * @param {string|number} number
 * @param {string} name
 * @param {string} description
 */
function appendCardToHand({ number, name, description }) {
    let cardTemplate = document.getElementById('card-template').cloneNode(true)

    // Remove template id and add card class
    cardTemplate.id = ''
    cardTemplate.classList.add('card')

    // Add a more searchable class to make removing cards a bit easier
    cardTemplate.classList.add(`card-${number}`)

    // Update the card with the given values
    cardTemplate.getElementsByClassName('card-number')[0].innerText = number
    cardTemplate.getElementsByClassName('card-title')[0].innerText = name
    cardTemplate.getElementsByClassName('card-description')[0].innerText = description

    // Append the card to the user's hand
    document.getElementById('user-cards').appendChild(cardTemplate)
}

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
            waitingTransition()
            break
        case 'c':
            countdownHandle = startCountdown()
            break
        case 'g':
            // Get our first dealt hand
            if (options.playerHands)
                clientState.hand = options.playerHands[clientUsername]
            // Get the player whose turn it is
            if (options.playerTurn)
                clientState.playerTurn = options.playerTurn

            // Reset the scores object
            clientState.scores = clientState.players.map((p) => ({ [p.username]: 0 }))

            // Transition the UI
            gameplayTransition()
            break
        default:
            console.log(`Unknown state change: ${state}`)
    }
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

socket.on('statechange', function ({ state, playerHands, playerTurn }) {
    handleStateChange(state, {
        playerHands: playerHands,
        playerTurn: playerTurn
    })
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