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
    button(@click="addMessage") Add Message
</template>

<script>
import countdown from "./countdown.vue"
import scoreBoard from "./score-board.vue"
import messages from "./messages.vue"

export default {
  name: "game-board",
  components: { countdown, scoreBoard, messages },
  data() {
    return {
      players: [
        { name: 'Test 1', score: 0 },
        { name: 'Test 2', score: 2 },
        { name: 'Test 3', score: 1 },
      ],
      messages: [
          'Hello World!',
          'Test!',
          'Test2!',
          'Lorem Ipsum',
          'Some Text',
          'Some more text',
          'Some other text',
          'other text',
          'text!',
          'why not more text',
          'even more text',
      ],
      startCountdown: false,
      stopCountdown: false,
      resetCountdown: false,
    }
  },
  methods: {
    addMessage() {
      this.messages.push('Test!')
    },
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