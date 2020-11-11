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

// Keep track of selected card and victim
let selectedCard = null
let selectedVictim = null

/**
 * Handle a state change.
 * @param state
 * @param playerHands
 * @param playerTurn
 * @param deckCount
 */
function handleStateChange(state, { playerHands, deckCount } = {}) {
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
            if (playerHands) {
                clientState.hand = playerHands[clientUsername]
                clientState.hand.forEach(card => appendCardToHand({
                    number: card.number,
                    name: card.name,
                    description: card.description,
                    requiresVictim: card.requiresVictim
                }))
            }

            // Set deck count
            if (deckCount)
                updateDeckCount(deckCount)

            // Reset the scores object
            clientState.scores = {}
            clientState.players.forEach(p => clientState.scores[p.username] = 0)

            // Transition the UI
            gameplayTransition(clientState, clientUsername)
            break
        default:
            console.log(`Unknown state change: ${state}`)
    }

    clientState.gameState = state
}

function updateHand(newHand) {
    updateHandUI(newHand)
    clientState.hand = newHand
}

function updatePlayerTurn(newPlayerTurn) {
    if (!newPlayerTurn)
        return

    updatePlayerTurnUI(newPlayerTurn)

    if (newPlayerTurn === clientUsername) {
        setCardListeners()
        setOpponentListeners()
    } else {
        clearCardListeners()
        clearOpponentListeners()
    }

    clientState.playerTurn = newPlayerTurn
}

function updatePlayers(players) {
    players.forEach((p) => {
        let playerIndex = getPlayerIndex(clientState.players, p.username)
        if (playerIndex < 0) {
            console.log(`Unable to find player ${p.username} in players list`)
            return
        }

        let player = clientState.players[playerIndex]
        let isOpponent = player.username !== clientUsername

        // Update isOut status
        if (p.isOut !== player.isOut) {
            player.isOut = p.isOut

            if (player.isOut) {
                if (isOpponent) {
                    setOpponentIsOut({ opponentName: player.username, isOut: player.isOut })
                    logMessage(`${player.username} is out.`)
                } else
                    logMessage('You are out.')
            }
        }

        // Update isProtected status
        if (p.isProtected !== player.isProtected) {
            player.isProtected = p.isProtected

            if (player.isProtected) {
                if (isOpponent) {
                    setOpponentIsProtected({ opponentName: player.username, isProtected: player.isProtected })
                    logMessage(`${player.username} has protection until round ${player.isProtected}.`)
                } else
                    logMessage(`You have protection until round ${player.isProtected}.`)
            }
        }

        // update playedCards list
    })
}

function updateScores(scores) {

}

function handleWin(winner) {
    console.log('Winner:', winner)
}

// ---- Socket events ---- //
// This is the initial message from the server
socket.on('curstate', function (curState) {
    clientState = curState

    handleStateChange(curState.gameState, {
        playerHands: curState.playerHands,
        deckCount: curState.deckCount
    })

    updatePlayerTurn(curState.playerTurn)
})

socket.on('playerconnection', function (payload) {
    clientState.players.push(payload)
    addPlayerToReadyBoard(payload.username, payload.isReady)
})

socket.on('playerdisconnect', function ({ username, state }) {
    if (state === 'g') {
        let playerIndex = getPlayerIndex(clientState.players, username)
        clientState.players[playerIndex].disconnected = true
        setOpponentStatus({ name: username, status: 'Disconnected' })
        logMessage(`${username} has disconnected.`)
    } else {
        clientState.players = clientState.players.filter(p => p.username !== username)
        removePlayerFromReadyBoard(username)
    }
})

socket.on('playerreconnect', function ({ username }) {
    let playerIndex = getPlayerIndex(clientState.players, username)
    if (playerIndex < 0)
        return console.log(`Received reconnect from unknown player ${username}`)

    clientState.players[playerIndex].disconnected = false
    setOpponentStatus({ name: username, status: 'Connected' })
    logMessage(`${username} has reconnected.`)
})

socket.on('playerready', function ({ username, ready, gameState }) {
    let playerIndex = getPlayerIndex(clientState.players, username)
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

socket.on('statechange', function ({ state, playerHands, playerTurn, deckCount, players }) {
    handleStateChange(state, {
        playerHands: playerHands,
        deckCount: deckCount,
        players: players
    })

    updatePlayerTurn(playerTurn)
})

socket.on('handplayed', function ({ gameState, playerHands, playerTurn, players, scores, winner, log, victimCard, deckCount }) {
    if (log)
        logMessage(log)

    if (winner)
        handleWin(winner)

    if (gameState !== clientState.gameState) {
        handleStateChange(gameState, {
            playerHands: playerHands,
            playerTurn: playerTurn
        })
    } else {
        updatePlayers(players)
        updateScores(scores)
        updateHand(playerHands[clientUsername])
        updatePlayerTurn(playerTurn)
        updateDeckCount(deckCount)
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
document.getElementById('ready-btn').addEventListener('click', function (e) {
    socket.emit('ready', { ready: e.target.checked })
})

function playCard() {
    // TODO: get requiresVictim property from server
    // TODO: if all opponents are unavailable for victimizing, discard card either against self or no effect

    // Can't play card unless a card and victim are selected
    if (!selectedCard || !selectedVictim)
        return

    // Prompt user for their guess
    let guess = null
    if (selectedCard.title === 'Wagie') {
        // TODO
    }

    socket.emit('playhand', {
        player: clientUsername,
        card: selectedCard.title,
        victim: selectedVictim,
        guess: guess
    })
}

function onCardClick(e) {
    // I want the main card element, so if the user clicks on something inside the
    // card, get the parent node. There is only one level of children so this should be fine.
    let card = e.target.classList.contains('card') ? e.target : e.target.parentNode

    let cardTitle = card.getElementsByClassName('card-title')[0].innerText
    let cardNumber = card.getElementsByClassName('card-number')[0].innerText
    let requiresVictim = card.getElementsByClassName('requires-victim')[0].value

    // Card is already selected, deselect card
    if (selectedCard && selectedCard.title === cardTitle) {
        selectedCard = null
        card.classList.remove('selected')
    } else {
        // If another card is selected, remove the selected class from it
        if (selectedCard) {
            let previousSelection = document.getElementsByClassName(`card-${selectedCard.number}`)[0]
            if (previousSelection) {
                previousSelection.classList.remove('selected')
            }
        }

        selectedCard = {
            title: cardTitle,
            number: cardNumber,
            requiresVictim: Boolean(requiresVictim)
        }

        card.classList.add('selected')
    }

    playCard()
}

function setCardListeners() {
    document.querySelectorAll('.card').forEach((el) => {
        el.addEventListener('click', onCardClick)
        el.classList.add('selectable')
    })
}

function clearCardListeners() {
    // Also reset selected card
    selectedCard = null

    document.querySelectorAll('.card').forEach((el) => {
        el.removeEventListener('click', onCardClick)
        el.classList.remove('selected')
        el.classList.remove('selectable')
    })
}

function onOpponentClick(e) {
    // Same thing as onCardClick except there are multiple levels of children so we must loopty loop
    let opponent = getParentRec(e.target, (el) => el.classList.contains('opponent'))
    if (opponent === false) {
        console.error('Unable to find parent opponent node.')
        return
    }

    let opponentName = opponent.getElementsByClassName('opponent-name')[0].innerText

    // Remove selected class from a previous selection
    if (selectedVictim) {
        let previousSelection = document.getElementsByClassName(`opponent-${selectedVictim}`)[0]
        if (previousSelection)
            previousSelection.classList.remove('selected')
    }

    // Similar to onCardClick above
    if (selectedVictim === opponentName) {
        selectedVictim = null
    } else {
        selectedVictim = opponentName
        opponent.classList.add('selected')
    }

    playCard()
}

function setOpponentListeners() {
    document.querySelectorAll('.opponent').forEach((el) => {
        el.addEventListener('click', onOpponentClick)
        el.classList.add('selectable')
    })
}

function clearOpponentListeners() {
    // Also reset selected victim
    selectedVictim = null

    document.querySelectorAll('.opponent').forEach((el) => {
        el.removeEventListener('click', onOpponentClick)
        el.classList.remove('selected')
        el.classList.remove('selectable')
    })
}