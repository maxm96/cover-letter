/**
 * Misc. util functions.
 */

/**
 * Recursively search for a parent element that passes the given test.
 * @param {Node} el
 * @param {function} test
 * @param {int} depth
 * @return {Node|boolean} Return the node if found or false on failure
 */
function getParentRec(el, test, depth = 3) {
    let found = false

    do {
        if (test(el)) {
            found = true
            break
        } else
            el = el.parentNode
    } while (--depth > -1)

    return found ? el : false
}

/**
 * Find the player with the given username.
 * @param {array} players
 * @param {string} username
 * @return {*}
 */
function getPlayerIndex(players, username) {
    return players.findIndex(p => p.username === username)
}

/**
 * Returns true if the given user can discard their card. This is the case if all other players are either out
 * or have protection. If the card can be played against the user, it must be used that way.
 * @param {array} players
 * @param {string} username
 * @param {object} card
 * @return {boolean}
 */
function canDiscardCard(players, username, card) {
    let nonUserPlayers = players.filter(p => p.username !== username)
    let allUsersAreUnavailable = nonUserPlayers.every(p => p.isOut || p.isProtected)

    return allUsersAreUnavailable && !card.canPlayAgainstSelf
}