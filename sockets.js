/**
 * Initialize websocket events.
 * @param sio
 * @param Game
 */
module.exports = function (sio, Game) {
    sio.sockets.on('connection', (socket) => {
        const username = socket.request.session.username

        console.log(`New connection from ${username}`)

        // One time connection
        let res = Game.onConnection(username)
        if (res.success) {
            console.log(`Accepted connection from ${username}`)

            // Broadcast to other clients that a new person has joined
            socket.broadcast.emit('playerconnection', res)

            // Send the list of players and game state to the new client
            socket.emit('curstate', Game.clientState())
        } else {
            console.log(`Rejected connection from ${username}`)

            socket.emit('connectionfailed', res)
        }

        socket.on('disconnect', () => {
            console.log(`Received disconnect from ${username}`)

            let res = Game.onDisconnect(username)
            if (res.success)
                sio.emit('playerdisconnect', res)
            else
                socket.emit('disconnectfailed', res)
        })

        socket.on('ready', ({ ready }) => {
            console.log(`Received 'ready: ${ready}' from ${username}`)

            let res = Game.onReady(username, ready)
            if (res.success)
                sio.emit('playerready', res)
            else
                socket.emit('readyfailed', res)
        })
    })
}