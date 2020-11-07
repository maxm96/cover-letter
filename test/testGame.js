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

        it('should accept a disconnected user during gameplay', function () {
            Game.state = GameStates.GAMEPLAY
            let res = Game.onDisconnect('someusername')
            assert(res.success)

            res = Game.onConnection('someusername')
            assert(res.success)
            assert(!Game.players[Game.getPlayerIndex('someusername')].disconnected)
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

        it('should set the disconnected property on a disconnect during gameply', function () {
            let res = Game.onConnection('someusername')
            assert(res.success)

            Game.state = GameStates.GAMEPLAY
            res = Game.onDisconnect('someusername')
            assert(res.success)

            let playerIndex = Game.getPlayerIndex('someusername')

            // someusername exists in players array
            assert(playerIndex > -1)

            // someusername disconnected is properly set
            assert(Game.players[playerIndex].disconnected)
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

    describe('advanceTurn', function () {
        const Game = new G()
        Game.onConnection('someuser1')
        Game.onConnection('someuser2')

        it('should advance to the next player', function () {
            Game.playerTurn = 'someuser1'
            Game.advanceTurn()

            assert(Game.playerTurn === 'someuser2')
        })

        it('should skip eliminated and disconnected players', function () {
            // Still on someuser2's turn
            assert(Game.playerTurn === 'someuser2')

            Game.onConnection('someuser3')
            Game.onConnection('someuser4')
            Game._setIsProperty('someuser3', 'isOut', true)
            Game._setIsProperty('someuser4', 'disconnected', true)
            Game.advanceTurn()

            assert(Game.playerTurn === 'someuser1')
        })

        it('should still work if the current player is out', function () {
            // Still on someuser1's turn
            assert(Game.playerTurn === 'someuser1')

            Game._setIsProperty('someuser1', 'isOut', true)
            Game.advanceTurn()

            assert(Game.playerTurn === 'someuser2')
        })
    })

    describe('checkForEliminationVictory', function () {
        const Game = new G()
        Game.onConnection('someuser1')
        Game.onConnection('someuser2')
        Game.onConnection('someuser3')

        it('should return false if there is more than one non-eliminated player', function () {
            Game._setIsProperty('someuser2', 'isOut', true)
            assert(!Game.checkForEliminationVictory())
        })

        it('should return the last standing user', function () {
            Game._setIsProperty('someuser3', 'isOut', true)
            assert(Game.checkForEliminationVictory() === 'someuser1')
        })
    })

    describe('checkForCardVictory', function () {
        const Game = new G()
        Game.onConnection('someuser1')
        Game.onConnection('someuser2')
        Game.onConnection('someuser3')

        it('should return false if there are still cards left in the deck', function () {
            Game.deck = ['one']
            assert(!Game.checkForCardVictory())
        })

        it('should return the correct winner', function () {
            Game.deck = []
            Game._dealCard('someuser1', 'Wagie')
            Game._dealCard('someuser2', 'HR')
            Game._dealCard('someuser3', 'Shareholder')

            assert(Game.checkForCardVictory() === 'someuser3')
        })

        it('should handle ties', function () {
            Game.deck = []
            Game._dealCard('someuser1', 'Wagie')
            Game._dealCard('someuser2', 'Salaried Worker')
            Game._dealCard('someuser3', 'Salaried Worker')

            Game._dealPlayedCard('someuser2', 'Shareholder')
            Game._dealPlayedCard('someuser2', 'Wagie')
            Game._dealPlayedCard('someuser3', 'Shareholder')
            Game._dealPlayedCard('someuser3', 'HR')

            assert(Game.checkForCardVictory() === 'someuser3')
        })

        it('should not count out players', function () {
            Game.deck = []
            Game._dealCard('someuser1', 'Wagie')
            Game._dealCard('someuser2', 'HR')
            Game._dealCard('someuser3', 'Shareholder')
            Game._setIsProperty('someuser3', 'isOut', true)

            assert(Game.checkForCardVictory() === 'someuser2')
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

            Game._dealCard('someuser1', 'Wagie')
            Game.playerTurn = 'someuser1'

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
            Game._dealCard('someuser1', 'CEO', false)
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
            Game._dealCard('someuser1', 'Wagie', false)
            Game._dealCard('someuser2', 'CEO')
            Game.playerTurn = 'someuser1'

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
            Game._dealCard('someuser1', 'Wagie', false)
            Game._dealCard('someuser2', 'Wagie')
            Game.playerTurn = 'someuser1'

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
            Game.playerTurn = 'someuser1'

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