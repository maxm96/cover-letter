const assert = require('assert')
const G = require('../src/models/Game')
const GameStates = require('../src/models/GameStates')

describe('Game', function () {
    describe('onConnection', function () {
        const Game = new G()

        it('should accept a connection', function () {
            let res = Game.onConnection('someusername')

            assert(res.success)
            assert(res.username === 'someusername')
            assert(!res.isReady)
        })

        it('should reject duplicate usernames', function () {
            let res = Game.onConnection('someusername')

            assert(!res.success)
        })

        it('should only accept 4 users', function () {
            for (let i = 0; i < 3; i++)
                Game.onConnection(String(i))

            let res = Game.onConnection('onemore')
            assert(!res.success)
        })
    })

    describe('onDisconnect', function () {
        const Game = new G()

        it('should remove a player', function () {
            Game.onConnection('someusername')
            let res = Game.onDisconnect('someusername')
            assert(res.success)
        })

        it('should complain if given non-existing user', function () {
            let res = Game.onDisconnect('nonexistent')
            assert(!res.success)
        })

        it('should change state on disconnect', function () {
            // Add some random user
            let res = Game.onConnection('someusername')
            assert(res.success)

            Game.state = GameStates.COUNTDOWN
            res = Game.onDisconnect('someusername')
            assert(res.state === GameStates.WAITING)
        })
    })

    describe('onReady', function () {
        const Game = new G()
        Game.onConnection('someuser1')
        Game.onConnection('someuser2')

        it('should toggle a player\'s ready status', function () {
            let res = Game.onReady('someuser1', true)
            assert(res.success)
            assert(res.username === 'someuser1')
            assert(res.ready)

            res = Game.onReady('someuser1', false)
            assert(res.success)
            assert(res.username === 'someuser1')
            assert(!res.ready)
        })

        it('should fail if readying in a non-waiting state', function () {
            Game.state = 'COUNTDOWN'

            let res = Game.onReady('someuser1', true)
            assert(!res.success)
        })

        it('should fail if unreadying in a gameplay state', function () {
            Game.state = GameStates.GAMEPLAY

            let res = Game.onReady('someuser1', false)
            assert(!res.success)
        })

        it('updates state if all players are ready', function () {
            Game.state = GameStates.WAITING

            let res = Game.onReady('someuser1', true)
            assert(res.success)

            res = Game.onReady('someuser2', true)
            assert(res.success)
            assert(res.gameState === GameStates.COUNTDOWN)
        })

        it('should update state if not all players are ready', function () {
            let res = Game.onReady('someuser1', false)
            assert(res.success)
            assert(res.gameState === GameStates.WAITING)
        })
    })
})