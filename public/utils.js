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