/**
 * Functions that update the DOM will go in here.
 */

/**
 * Start the ready countdown.
 * @return {number}
 */
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

/**
 * Hide the ready countdown.
 */
function hideCountdown() {
    document.getElementById('countdown').style.display = 'none'
}

/**
 * Display the given error message forever and hide the rest of the page.
 * Used for really bad things like connection failure.
 * @param {string} message
 */
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

/**
 * Show the given error message for 5 seconds.
 * @param {string} message
 */
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

/**
 * Append the given message to the log box.
 * @param {string} message
 * @param {boolean} admin Log message without the '>>' prepend
 */
function logMessage(message, admin = false) {
    let log = document.getElementById('log')

    let formatted = admin ? message : `>> ${message}`

    // Don't add a newline if this is the first message
    log.value = log.value + `${log.value !== '' ? '\n' : ''}${formatted}`

    // Manually dispatch change event
    log.dispatchEvent(new Event('change'))
}

/**
 * Add a row to the ready board with the given player name and ready status.
 * @param {string} playerName
 * @param {boolean} ready
 */
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

/**
 * Remove the given player from the ready board.
 * @param {string} playerName
 */
function removePlayerFromReadyBoard(playerName) {
    let row = document.getElementById(`ready-table-row-${playerName}`)
    document.getElementById('ready-board').deleteRow(row.rowIndex)
}

/**
 * Hide the lobby UI, show the game board UI. Create scoreboard, opponent list, and log the first player.
 * @param {object} clientState
 * @param {string} clientUsername
 */
function gameplayTransition(clientState, clientUsername) {
    document.getElementById('lobby').style.display = 'none'
    document.getElementById('game-board').style.display = 'block'

    // Reset log
    document.getElementById('log').value = ''

    // Remove any current-turn classes
    document.querySelectorAll('.current-turn')
        .forEach(ct => ct.classList.remove('current-turn'))

    // Reset scoreboard
    let scoreboard = document.getElementById('scoreboard').getElementsByTagName('tbody')[0]
    scoreboard.innerHTML = ''

    // Add players to scoreboard and opponents list
    clientState.players.forEach((p) => {
        addUserToScoreboard({
            username: p.username,
            score: clientState.scores[p.username] || 0
        })

        // Don't add the current player to the opponents list
        if (p.username === clientUsername)
            return

        appendOpponent({
            name: p.username,
            status: 'Connected',
            playedCards: []
        })
    })
}

/**
 * Hide the game board UI, show the lobby UI. Recreate the ready board.
 * @param {object} clientState
 */
function waitingTransition(clientState) {
    let lobby = document.getElementById('lobby')

    lobby.style.display = 'block'

    // Reset ready table tbody
    let oldBody = document.querySelector('tbody')
    let newBody = document.createElement('tbody')
    oldBody.parentNode.replaceChild(newBody, oldBody)

    // Repopulate table
    clientState.players.forEach(p => addPlayerToReadyBoard(p.username, p.isReady))

    // Just hide the game board
    document.getElementById('game-board').style.display = 'none'
}

/**
 * Append a table row to the scoreboard.
 * @param {string} username
 * @param {string|number|undefined} score
 */
function addUserToScoreboard({ username, score = '0' }) {
    let scoreboard = document.getElementById('scoreboard').getElementsByTagName('tbody')[0]
    let row = scoreboard.insertRow(-1)
    let usernameCell = row.insertCell(0)
    let scoreCell = row.insertCell(1)

    usernameCell.appendChild(document.createTextNode(username))
    scoreCell.appendChild(document.createTextNode(score))

    row.id = `scoreboard-${username}`
    usernameCell.id = `scoreboard-username-${username}`
    scoreCell.id = `scoreboard-score-${username}`
}

/**
 * Update the given user's score.
 * @param {string} username
 * @param {string|number} score
 */
function updateUserScore({ username, score }) {
    let userScoreCell = document.getElementById(`scoreboard-score-${username}`)
    if (!userScoreCell)
        return console.log(`No element found for id scoreboard-score-${username}`)

    userScoreCell.innerText = score
}

/**
 * Set the current-turn class on the correct opponent, or nobody if the player turn is the client.
 * @param {string} newPlayerTurn
 */
function updatePlayerTurnUI(newPlayerTurn) {
    // Remove current-turn class from old player
    let currentTurn = document.querySelector('.current-turn')
    if (currentTurn)
        currentTurn.classList.remove('current-turn')

    if (newPlayerTurn === clientUsername) {
        logMessage('It is your turn.')

        // Don't set current-turn class on user, because user doesn't exist
        return
    }

    logMessage(`It is ${newPlayerTurn}'s turn.`)

    document.getElementById(`opponent-${newPlayerTurn}`).classList.add('current-turn')
}

/**
 * Append a new card to the user's hand. Clones the card template and appends to user-cards.
 * @param {string|number} number
 * @param {string} name
 * @param {string} description
 * @param {int} requiresVictim
 * @param {int} canPlayAgainstSelf
 */
function appendCardToHand({
                              number,
                              name,
                              description,
                              requiresVictim,
                              canPlayAgainstSelf
}) {
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
    cardTemplate.getElementsByClassName('requires-victim')[0].value = requiresVictim
    cardTemplate.getElementsByClassName('against-self')[0].value = canPlayAgainstSelf

    // Append the card to the user's hand
    document.getElementById('user-cards').appendChild(cardTemplate)
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
 * Clear all cards from hand.
 */
function resetHand() {
    document.getElementById('user-cards').innerHTML = ''
}

/**
 * Append an opponent to the opponents div. Creates an opponent from the opponent template.
 * @param {string} name
 * @param {string} status
 * @param {array} playedCards
 */
function appendOpponent({ name, status, playedCards }) {
    let opponentTemplate = document.getElementById('opponent-template').cloneNode(true)

    // Remove template id and add opponent class
    opponentTemplate.id = ''
    opponentTemplate.classList.add('opponent')

    // Create a better class name
    opponentTemplate.classList.add(`opponent-${name}`)

    // Update the opponent with the give values
    opponentTemplate.getElementsByClassName('opponent-name')[0].innerText = name
    opponentTemplate.getElementsByClassName('opponent-status')[0].innerText = status

    // Create played card list
    let playedCardList = opponentTemplate.getElementsByClassName('opponent-card-list')[0]
    if (playedCards.length) {
        // Remove no cards played message from the list if it exists
        let noCardsPlayedMessage = playedCardList.getElementsByClassName('no-cards-played')
        if (noCardsPlayedMessage.length > 0)
            playedCardList.removeChild(noCardsPlayedMessage[0])

        playedCards.forEach(pc => addPlayedCardToList(playedCardList, pc))
    } else {
        // If there are no played cards, append a message saying so
        addPlayedCardToList(playedCardList, 'No cards played yet', 'no-cards-played')
    }

    // Assign a nice id
    opponentTemplate.id = `opponent-${name}`

    document.getElementById('opponents').appendChild(opponentTemplate)
}

function setOpponentStatus({ name, status }) {
    let opponent = document.getElementById(`opponent-${name}`)
    if (!opponent)
        return console.log(`No opponent found for ${name}`)

    opponent.getElementsByClassName('opponent-status')[0].innerText = status
}

/**
 * Reset the opponents div.
 */
function resetOpponents() {
    document.getElementById('opponents').innerHTML = ''
}

/**
 * Create and append a list item to the given list. Set the list items text and class if given one.
 * @param {object} playedCardsList
 * @param {string} text
 * @param {string|null} someClass
 */
function addPlayedCardToList(playedCardsList, text, someClass = null) {
    let li = document.createElement('li')
    li.innerText = text

    if (someClass)
        li.classList.add(someClass)

    playedCardsList.append(li)
}

/**
 * Update the deck count.
 * @param {string|number} newCount
 */
function updateDeckCount(newCount) {
    document.getElementById('deck').innerText = `Deck: ${newCount}`
}

/**
 * Append an array of cards to the user's hand.
 * @param newHand
 */
function updateHandUI(newHand) {
    resetHand()

    newHand.forEach((nh) => {
        appendCardToHand({
            number: nh.number,
            name: nh.name,
            description: nh.description,
            requiresVictim: nh.requiresVictim,
            canPlayAgainstSelf: nh.canPlayAgainstSelf
        })
    })
}

/**
 * Add or remove the out class on the given opponent.
 * @param {string} opponentName
 * @param {boolean} isOut
 */
function setOpponentIsOut({ opponentName, isOut }) {
    let opponent = document.getElementById(`opponent-${opponentName}`)
    if (!opponent) {
        console.error(`Unable to find opponent ${opponentName}`)
        return
    }

    if (isOut)
        opponent.classList.add('out')
    else
        opponent.classList.remove('out')
}

/**
 * Add or remove the protected class on the given opponent.
 * @param {string} opponentName
 * @param {boolean} isProtected
 */
function setOpponentIsProtected({ opponentName, isProtected }) {
    let opponent = document.getElementById(`opponent-${opponentName}`)
    if (!opponent) {
        console.error(`Unable to find opponent ${opponentName}`)
        return
    }

    if (isProtected !== false)
        opponent.classList.add('protected')
    else
        opponent.classList.remove('protected')
}

/**
 * Either show or hide the available cards list.
 * @param {boolean} show
 */
function toggleAvailableCards(show) {
    document.getElementById('available-cards').style.display = show ? 'inline-block' : 'none'
}

/**
 * Update scoreboard with the given scores
 * @param {object} scores
 */
function updateScoreboard(scores) {
    Object.keys(scores).forEach((user) => {
        let score = document.getElementById(`scoreboard-score-${user}`)
        if (!score) {
            console.error(`Unable to find scoreboard score for ${user}`)
            return
        }

        score.innerText = scores[user]
    })
}