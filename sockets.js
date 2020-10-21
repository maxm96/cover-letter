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
        if (res.success)
            sio.emit('playerconnection', res)
        else
            socket.emit('connectionfailed', res)

        socket.on('disconnect', () => {
            console.log(`Received disconnect from ${username}`)

            let res = Game.onDisconnect(username)
            if (res.success)
                sio.emit('playerdisconnect', res)
            else
                socket.emit('disconnectfailed', res)
        })

        socket.on('ready', () => {
            console.log(`Received ready from ${username}`)

            let res = Game.onReady(username)
            if (res.success)
                sio.emit('playerready', res)
            else
                socket.emit('readyfailed', res)
        })

        socket.on('unready', () => {
            console.log(`Received unready from ${username}`)

            let res = Game.onUnready(username)
            if (res.success)
                sio.emit('playerunready', res)
            else
                socket.emit('unreadyfailed', res)
        })
    })
}