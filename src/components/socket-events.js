/**
 * Put all socket event listener initialization in here to keep component tidy. Run all on mounted.
 */
export default {
    mounted() {
        this.socket = io()

        let vm = this
        this.socket.on('curstate', function (curState) {
            vm.gameState = curState.gameState
            vm.players = curState.players
        })

        this.socket.on('playerready', function ({ username, ready, gameState }) {
            vm.gameState = gameState

            let player = vm.players.find(p => p.username === username)
            player.ready = ready

            vm.players.splice(
                vm.players.findIndex(p => p.username === username),
                1,
                player
            )
        })

        this.socket.on('playerconnection', function (player) {
            vm.players.push(player)
        })

        this.socket.on('playerdisconnect', function ({ username, state }) {
            vm.gameState = state

            let player = vm.players.find(p => p.username === username)
            if (!player) {
                console.log(`playerdisconnect: unable to find player with username ${username}`)
                return
            }

            if (vm.isGameplay) {
                // Set disconnected property if in gameplay
                player.disconnected = true
                vm.players.splice(
                    vm.players.findIndex(p => p.username === username),
                    1,
                    player
                )
            } else {
                // Otherwise, just remove the player
                vm.players.splice(vm.players.findIndex(p => p.username === username), 1)
            }
        })

        this.socket.on('playerreconnect', function ({ username }) {
            let player = vm.players.find(p => p.username === username)
            if (!player) {
                console.log(`playerreconnect: unable to find player with username ${username}`)
                return
            }

            player.disconnected = false
            vm.players.splice(
                vm.players.findIndex(p => p.username === username),
                1,
                player
            )
        })

        // TODO
        this.socket.on('statechange', function(payload) {
            vm.gameState = payload.gameState
            vm.deckCount = payload.deckCount
            vm.log = payload.log
            vm.scores = payload.scores
            vm.players = payload.players
            vm.roundTime = payload.roundTime
        })
        this.socket.on('handplayed', function (payload) {
            console.log('HANDPLAYED', payload)
        })
        this.socket.on('timesup', function (player) {
            if (player !== vm.username) {
                return
            }

            // TODO: play random card
        })

        // TODO: error handling
        this.socket.on('playhandfailed', function ({ message }) {

        })
        this.socket.on('connectionfailed', function ({ message }) {

        })
        this.socket.on('readyfailed', function ({ message }) {

        })
    }
}