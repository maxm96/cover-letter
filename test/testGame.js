const assert = require('assert')
const G = require('../src/models/Game')
const GameStates = require('../src/models/GameStates')

const Player = require('../src/models/Player')

describe('Game', function () {
    describe('onConnection', function () {
        const Game = new G()

        it('should accept a connection', function () {
            let res = Game.onConnection('someusername')

            assert(res.success)
            assert(res.username === 'someusername')
            assert(!res.isReady)
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

    describe('onPlayHand', function () {
        const Game = new G()
        Game.onConnection('someuser1')
        Game.onConnection('someuser2')

        it('should fail if not in gameplay state', function () {
            let res = Game.onPlayHand({})
            assert(!res.success)
        })

        it('should fail if not given a proper action', function () {
            Game.changeState(GameStates.GAMEPLAY)

            let res = Game.onPlayHand({})
            assert(!res.success)
        })

        it('should fail if given an invalid target', function () {
            let res = Game.onPlayHand({
                player: 'someuser1',
                victim: 'nonexistent',
                card: 'Wagie',
                guess: 'CEO'
            })

            assert(!res.success)
        })

        it('should fail if not user\'s turn', function () {
            Game.playerTurn = 'someuser2'

            let res = Game.onPlayHand({
                player: 'someuser1',
                victim: 'someuser2',
                card: 'Wagie',
                guess: 'CEO'
            })

            assert(!res.success)
        })

        it('should properly apply the Wagie card', function () {
            Game.playerTurn = 'someuser1'
            Game.dealCard('someuser2', 'CEO')

            let res = Game.onPlayHand({
                player: 'someuser1',
                card: 'Wagie',
                victim: 'someuser2',
                guess: 'HR'
            })

            assert(res.success)
            assert(res.update.applyTo === 'someuser2')
            assert(!res.update.properties.isOut)

            res = Game.onPlayHand({
                player: 'someuser1',
                card: 'Wagie',
                victim: 'someuser2',
                guess: 'CEO'
            })

            assert(res.success)
            assert(res.update.applyTo === 'someuser2')
            assert(res.update.properties.isOut)
        })

        it('should properly apply the HR card', function () {
            Game.playerTurn = 'someuser1'
            Game.setIsOut('someuser2', false)
            Game.dealCard('someuser2', 'CEO')

            let res = Game.onPlayHand({
                player: 'someuser1',
                card: 'HR',
                victim: 'someuser2'
            })

            assert(res.success)
            assert(res.hand === 'CEO')
        })

        it('should properly apply the Shift Manager card', function () {
            Game.playerTurn = 'someuser1'
            Game.dealCard('someuser1', 'HR')
            Game.dealCard('someuser2', 'Motivational Speaker')

            let res = Game.onPlayHand({
                player: 'someuser1',
                card: 'Shift Manager',
                victim: 'someuser2'
            })

            assert(res.success)
            assert(res.update.applyTo === 'someuser1')
            assert(res.update.properties.isOut)

            Game.setIsOut('someuser1', false)

            Game.dealCard('someuser1', 'HR')
            Game.dealCard('someuser2', 'HR')

            res = Game.onPlayHand({
                player: 'someuser1',
                card: 'Shift Manager',
                victim: 'someuser2'
            })

            assert(res.success)
            assert(res.update === null)
        })

        it('should properly apply the Recommendation Letter card', function () {
            Game.playerTurn = 'someuser1'
            Game.currentRound = 3

            let res = Game.onPlayHand({
                player: 'someuser1',
                card: 'Recommendation Letter'
            })

            assert(res.success)
            assert(res.update.applyTo === 'someuser1')
            assert(res.update.properties.isProtected === (Game.currentRound + 1))
        })

        it('should properly apply the Salaried Worker card', function () {
            Game.playerTurn = 'someuser1'
            Game.dealCard('someuser2', 'CEO')

            let res = Game.onPlayHand({
                player: 'someuser1',
                card: 'Salaried Worker',
                victim: 'someuser2'
            })

            assert(res.success)
            assert(res.update.applyTo === 'someuser2')
            assert(!res.update.properties.isOut)
            assert(Game.players[Game.getPlayerIndex('someuser2')].hand.length === 0)

            Game.dealCard('someuser2', 'Shareholder')

            res = Game.onPlayHand({
                player: 'someuser1',
                card: 'Salaried Worker',
                victim: 'someuser2'
            })

            assert(res.success)
            assert(res.update.applyTo === 'someuser2')
            assert(res.update.properties.isOut)
        })

        it('should properly apply the Motivational Speaker card', function () {
            Game.playerTurn = 'someuser1'
            Game.setIsOut('someuser2', false)
            Game.dealCard('someuser1', 'Wagie')
            Game.dealCard('someuser2', 'HR')

            let res = Game.onPlayHand({
                player: 'someuser1',
                card: 'Motivational Speaker',
                victim: 'someuser2'
            })

            assert(res.success)
            assert(res.update === null)

            let someUser1Hand = Game.players[Game.getPlayerIndex('someuser1')].hand
            let someUser2Hand = Game.players[Game.getPlayerIndex('someuser2')].hand

            assert(someUser1Hand.length === 1)
            assert(someUser2Hand.length === 1)
            assert(someUser1Hand[0].name === 'HR')
            assert(someUser2Hand[0].name === 'Wagie')
        })

        it('should properly apply the CEO card', function () {
            // Not much happens for this card
        })

        it('should properly apply the Shareholder card', function () {
            Game.playerTurn = 'someuser1'

            let res = Game.onPlayHand({
                player: 'someuser1',
                card: 'Shareholder'
            })

            assert(res.success)
            assert(res.update.applyTo === 'someuser1')
            assert(res.update.properties.isOut)
        })
    })
})