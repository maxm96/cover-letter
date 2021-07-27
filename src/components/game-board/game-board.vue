<template lang="pug">
  #game-board
    #upper-board
      score-board(:players="players")
      countdown(
        :max-count="60"
        :do-start="startCountdown"
        :do-stop="stopCountdown"
        :do-reset="resetCountdown"
        @countdown:finished="onCountdownFinished"
      )
      messages(:messages="messages")
    opponents(:opponents="opponents")
</template>

<script>
import countdown from "./countdown.vue"
import scoreBoard from "./score-board.vue"
import messages from "./messages.vue"
import opponents from "./opponents.vue"

export default {
  name: "game-board",
  components: { countdown, scoreBoard, messages, opponents },
  props: ['players', 'messages'],
  data() {
    return {
      opponents: [
        {
          username: 'Test',
          isOut: false,
          isProtected: false,
          playedCards: ['Wagie', 'CEO'],
          disconnected: false,
        },
        {
          username: 'Test 2',
          isOut: true,
          isProtected: false,
          playedCards: [],
          disconnected: false,
        },
        {
          username: 'Test 3',
          isOut: false,
          isProtected: true,
          playedCards: ['Wagie', 'Shareholder', 'Wagie', 'Wagie', 'Recommendation Letter'],
          disconnected: true,
        }
      ],
      startCountdown: false,
      stopCountdown: false,
      resetCountdown: false,
    }
  },
  methods: {
    onCountdownStart() {
      this.startCountdown = true
      setTimeout(() => this.startCountdown = false, 500)
    },
    onCountdownStop() {
      this.stopCountdown = true
      setTimeout(() => this.stopCountdown = false, 500)
    },
    onCountdownReset() {
      this.resetCountdown = true
      setTimeout(() => this.resetCountdown = false, 500)
    },
    onCountdownFinished() {
      console.log('Countdown finished!')
    },
  },
}
</script>

<style scoped>
#game-board {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 250px;
  border: red 2px solid;
}

#upper-board {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 250px;
}
</style>