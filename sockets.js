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
            // The username will not be set if the user is technically already joined. This happens via new tab.
            if (res.username) {
                // Broadcast to other clients that a new person has joined
                socket.broadcast.emit('playerconnection', res)
            }

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
            else {
                console.log(`Disconnect failed for ${username}`)
                socket.emit('disconnectfailed', res)
            }
        })

        socket.on('ready', ({ ready }) => {
            console.log(`Received 'ready: ${ready}' from ${username}`)

            let res = Game.onReady(username, ready)
            if (res.success)
                sio.emit('playerready', res)
            else {
                console.log(`Ready failed for ${username}`)
                socket.emit('readyfailed', res)
            }
        })

        socket.on('playhand', ({ player, card, victim, guess }) => {
            console.log(`${player} played card ${card}`)

            let res = Game.onPlayHand({ cardName: card, playerName: player, victimName: victim, guess: guess })
            if (res.success)
                sio.emit('handplayed')
            else {
                console.log(`Failed to play hand: ${res.message}`)
                socket.emit('playhandfailed', res)
            }
        })
    })
}