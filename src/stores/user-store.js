/**
 * A dictionary of usernames. active attribute is true if the username is being used.
 * @type {{}}
 */
let UserStore = {}

function addUser(username) {
    UserStore[username] = { active: true }
}

function setActive(username) {
    UserStore[username]['active'] = true
}

function setInactive(username) {
    UserStore[username]['active'] = false
}

function isActive(username) {
    return UserStore[username] ? UserStore[username]['active'] : false
}

module.exports = {
    addUser,
    setActive,
    setInactive,
    isActive
}