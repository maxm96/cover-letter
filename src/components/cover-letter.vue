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
import socketEvents from "./socket-events.js"

export default {
  name: "cover-letter",
  components: { lobby, gameBoard },
  mixins: [ socketEvents ],
  data() {
    return {
      socket: null,
      gameState: null,
      players: [],
      username: null,
      deckCount: 0,
      log: [],
      hands: [],
      scores: null,
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


  },
}
</script>

<style scoped>

</style>