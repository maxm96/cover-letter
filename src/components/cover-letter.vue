<template lang="pug">
  #cover-letter
    lobby(:players="players" :ready="isReady")
    game-board(v-if="gameState === 'g'")
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
    }
  },
  mounted() {
    // TODO: refactor this
    this.username = document.querySelector('#client_username').value

    this.socket = io()

    this.socket.on('curstate', function (curState) {
      this.gameState = curState.gameState
      this.players = curState.players
    })
  },
}
</script>

<style scoped>

</style>