<template lang="pug">
  #game-board
    #upper-board
      #scores
      countdown(
        :max-count="60"
        :do-start="startCountdown"
        :do-stop="stopCountdown"
        :do-reset="resetCountdown"
        @countdown:finished="onCountdownFinished"
      )
      button(@click="onCountdownStart") Start Countdown
      button(@click="onCountdownStop") Stop Countdown
      button(@click="onCountdownReset") Reset Countdown
      #messages
</template>

<script>
import countdown from "./countdown.vue"

export default {
  name: "game-board",
  components: { countdown },
  data() {
    return {
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
</style>