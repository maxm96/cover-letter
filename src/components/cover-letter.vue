<template lang="pug">
  #cover-letter
    lobby(
      v-if="!isGameplay"
      :players="players"
      :ready="isReady"
      :show-countdown="isCountdown"
      @lobby:ready-click="onReady"
    )
    game-board(v-if="isGameplay")
</template>

<script>
import gameBoard from "./game-board/game-board.vue"
import lobby from "./lobby/lobby.vue"

export default {
  name: "cover-letter",
  components: { lobby, gameBoard },
  data() {
    return {
      socket: null,
      gameState: null,
      players: [],
      username: null,
    }
  },
  computed: {
    isReady() {
      if (this.players.length) {
        let me = this.players.find(p => p.username === this.username)
        return me ? me.ready : false
      }
      return false
    },
    isGameplay() {
      return this.gameState === 'g'
    },
    isCountdown() {
      return this.gameState === 'c'
    },
  },
  methods: {
    onReady(ready) {
      this.socket.emit('ready', { ready: ready })
    },
  },
  mounted() {
    this.username = document.querySelector('#client_username').value

    this.socket = io()

    let vm = this
    this.socket.on('curstate', function (curState) {
      vm.gameState = curState.gameState
      vm.players = curState.players
    })

    this.socket.on('playerready', function ({ username, ready, gameState }) {
      vm.gameState = gameState

      console.log('gamestate', vm.gameState)
      console.log('isCountdown', vm.isCountdown)

      let player = vm.players.find(p => p.username === username)
      player.ready = ready

      vm.players.splice(
          vm.players.findIndex(p => p.username === username),
          1,
          player
      )
    })
  },
}
</script>

<style scoped>

</style>