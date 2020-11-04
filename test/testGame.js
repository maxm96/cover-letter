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

        it('should fail if someone plays out of turn', function () {
            Game.state = GameStates.GAMEPLAY
            Game.playerTurn = 'someuser1'

            let res = Game.onPlayHand({
                cardName: 'Wagie',
                playerName: 'someuser2',
                victimName: 'someuser1',
                guess: 'HR'
            })

            assert(!res.success)
        })

        it('should fail if not in gameplay state', function () {
            Game.state = GameStates.WAITING
            Game.playerTurn = 'someuser1'

            let res = Game.onPlayHand({
                cardName: 'Wagie',
                playerName: 'someuser1',
                victimName: 'someuser2',
                guess: 'HR'
            })

            assert(!res.success)
        })

        it('should fail if no card is given', function () {
            Game.state = GameStates.GAMEPLAY
            Game.playerTurn = 'someuser1'

            let res = Game.onPlayHand({
                playerName: 'someuser1',
                victimName: 'someuser2'
            })

            assert(!res.success)
        })

        it('should fail if victim does not exist', function () {
            Game.state = GameStates.GAMEPLAY
            Game.playerTurn = 'someuser1'

            let res = Game.onPlayHand({
                cardName: 'Wagie',
                playerName: 'someuser1',
                victimName: 'non-existent',
                guess: 'HR'
            })

            assert(!res.success)
        })

        it('should fail if victim is out', function () {
            Game.state = GameStates.GAMEPLAY
            Game.playerTurn = 'someuser1'
            Game._setIsProperty('someuser2', 'isOut', true)

            let res = Game.onPlayHand({
                cardName: 'Wagie',
                playerName: 'someuser1',
                victimName: 'someuser2',
                guess: 'HR'
            })

            assert(!res.success)

            Game._setIsProperty('someuser2', 'isOut', false)
        })

        it('should fail if victim is protected', function () {
            Game.state = GameStates.GAMEPLAY
            Game.playerTurn = 'someuser1'
            Game._setIsProperty('someuser2', 'isProtected', 100)

            let res = Game.onPlayHand({
                cardName: 'Wagie',
                playerName: 'someuser1',
                victimName: 'someuser2',
                guess: 'HR'
            })

            assert(!res.success)

            Game._setIsProperty('someuser2', 'isProtected', -1)
        })

        it('should fail if victim is disconnected', function () {
            Game.state = GameStates.GAMEPLAY
            Game.playerTurn = 'someuser1'
            Game._setIsProperty('someuser2', 'disconnected', true)

            let res = Game.onPlayHand({
                cardName: 'Wagie',
                playerName: 'someuser1',
                victimName: 'someuser2',
                guess: 'HR'
            })

            assert(!res.success)

            Game._setIsProperty('someuser2', 'disconnected', false)
        })

        it('should properly apply the Wagie card', function () {
            let someUser2Index = Game.getPlayerIndex('someuser2')
            Game.state = GameStates.GAMEPLAY
            Game.playerTurn = 'someuser1'
            Game._dealCard('someuser1', 'Wagie')
            Game._dealCard('someuser2', 'HR')

            let res = Game.onPlayHand({
                cardName: 'Wagie',
                playerName: 'someuser1',
                victimName: 'someuser2',
                guess: 'Motivational Speaker'
            })

            assert(res.success)
            assert(!Game.players[someUser2Index].isOut)

            res = Game.onPlayHand({
                cardName: 'Wagie',
                playerName: 'someuser1',
                victimName: 'someuser2',
                guess: 'HR'
            })

            assert(res.success)
            assert(Game.players[someUser2Index].isOut)

            Game._setIsProperty('someuser2', 'isOut', false)
        })

        it('should properly apply the HR card', function () {
            // TODO
        })

        it('should properly apply the Shift Manager card', function () {
            let someUser1Index = Game.getPlayerIndex('someuser1')
            let someUser2Index = Game.getPlayerIndex('someuser2')
            Game.state = GameStates.GAMEPLAY
            Game.playerTurn = 'someuser1'
            Game._dealCard('someuser1', 'Shift Manager')
            Game._dealCard('someuser2', 'Wagie')

            let res = Game.onPlayHand({
                cardName: 'Shift Manager',
                playerName: 'someuser1',
                victimName: 'someuser2'
            })

            assert(res.success)
            assert(!Game.players[someUser1Index].isOut)
            assert(Game.players[someUser2Index].isOut)

            Game._setIsProperty('someuser2', 'isOut', false)
            Game._dealCard('someuser1', 'Shift Manager')
            Game._dealCard('someuser2', 'CEO')

            res = Game.onPlayHand({
                cardName: 'Shift Manager',
                playerName: 'someuser1',
                victimName: 'someuser2'
            })

            assert(res.success)
            assert(Game.players[someUser1Index].isOut)
            assert(!Game.players[someUser2Index].isOut)

            Game._setIsProperty('someuser1', 'isOut', false)
            Game._dealCard('someuser1', 'Shift Manager')
            Game._dealCard('someuser2', 'Shift Manager')

            res = Game.onPlayHand({
                cardName: 'Shift Manager',
                playerName: 'someuser1',
                victimName: 'someuser2'
            })

            assert(res.success)
            assert(!Game.players[someUser1Index].isOut)
            assert(!Game.players[someUser2Index].isOut)
        })

        it('should properly apply the Recommendation Letter card', function () {
            let someUser1Index = Game.getPlayerIndex('someuser1')
            Game.state = GameStates.GAMEPLAY
            Game.playerTurn = 'someuser1'
            Game.currentRound = 4
            Game._dealCard('someuser1', 'Recommendation Letter')

            let res = Game.onPlayHand({
                cardName: 'Recommendation Letter',
                playerName: 'someuser1'
            })

            assert(res.success)
            assert(Game.players[someUser1Index].isProtected === Game.currentRound + 1)

            Game._setIsProperty('someuser1', 'isProtected', false)
        })

        it('should properly apply the Salaried Worker card', function () {
            let someUser2Index = Game.getPlayerIndex('someuser2')
            Game.state = GameStates.GAMEPLAY
            Game.playerTurn = 'someuser1'
            Game._dealCard('someuser1', 'Salaried Worker')
            Game._dealCard('someuser2', 'Wagie')

            let res = Game.onPlayHand({
                cardName: 'Salaried Worker',
                playerName: 'someuser1',
                victimName: 'someuser2'
            })

            assert(res.success)
            assert(Game.players[someUser2Index].hand.length === 0)

            Game._dealCard('someuser1', 'Salaried Worker')
            Game._dealCard('someuser2', 'Shareholder')

            res = Game.onPlayHand({
                cardName: 'Salaried Worker',
                playerName: 'someuser1',
                victimName: 'someuser2'
            })

            assert(res.success)
            assert(Game.players[someUser2Index].isOut)

            Game._setIsProperty('someuser2', 'isOut', false)
        })

        it('should properly apply the Motivational Speaker card', function () {
            let someUser1Index = Game.getPlayerIndex('someuser1')
            let someUser2Index = Game.getPlayerIndex('someuser2')
            Game.state = GameStates.GAMEPLAY
            Game.playerTurn = 'someuser1'
            Game._dealCard('someuser1', 'HR')
            Game._dealCard('someuser1', 'Motivational Speaker', false)
            Game._dealCard('someuser2', 'Wagie')

            let res = Game.onPlayHand({
                cardName: 'Motivational Speaker',
                playerName: 'someuser1',
                victimName: 'someuser2'
            })

            assert(res.success)
            assert(Game.players[someUser1Index].hand[0].name === 'Wagie')
            assert(Game.players[someUser2Index].hand[0].name === 'HR')
        })

        it('should properly apply the CEO card', function () {
            Game.state = GameStates.GAMEPLAY
            Game.playerTurn = 'someuser1'
            Game._dealCard('someuser1', 'CEO')

            let res = Game.onPlayHand({
                cardName: 'CEO',
                playerName: 'someuser1'
            })

            // Not much happens here
            assert(res.success)
        })

        it('should properly apply the Shareholder card', function () {
            Game.state = GameStates.GAMEPLAY
            Game.playerTurn = 'someuser1'
            Game._dealCard('someuser1', 'Shareholder')

            let res = Game.onPlayHand({
                cardName: 'Shareholder',
                playerName: 'someuser1'
            })

            assert(res.success)
            assert(Game.players[Game.getPlayerIndex('someuser1')].isOut)
        })
    })
})