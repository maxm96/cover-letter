/**
 * DOM event listeners will go in here.
 */

document.getElementById('ready-btn').addEventListener('click', function (e) {
    socket.emit('ready', { ready: e.target.checked })
})