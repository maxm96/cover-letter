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

    #lower-board
      action-buttons(
        :show-play-button="showPlayButton"
        :show-discard-button="showDiscardButton"
        :show-against-self-button="showAgainstSelfButton"
      )
      hand(:cards="hand" @hand:card-click="onCardClick")
</template>

<script>
import lobby from "../lobby/lobby.vue"
import countdown from "../countdown.vue"
import scoreBoard from "./score-board.vue"
import messages from "./messages.vue"
import opponents from "./opponents.vue"
import actionButtons from "./action-buttons.vue"
import hand from "./hand.vue"

export default {
  name: "game-board",
  components: { lobby, countdown, scoreBoard, messages, opponents, actionButtons, hand },
  data() {
    return {
      players: [],
      messages: [],
      opponents: [],
      hand: [],
      showPlayButton: false,
      showDiscardButton: false,
      showAgainstSelfButton: false,
      startCountdown: false,
      stopCountdown: false,
      resetCountdown: false,
      socket: null,
    }
  },
  computed: {
    playingGame() {
      return false
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
    onCardClick(cardId) {
      // First clear any other selected cards (there should only be one other)
      let selectedCard = this.hand.find(c => c.selected)
      if (selectedCard) {
        selectedCard.selected = false
        this.hand.splice(
            this.hand.findIndex(c => c.id === selectedCard.id),
            1,
            selectedCard
        )
      }

      // Toggle the card that was clicked on. This will keep the user from unselecting a selected card as well.
      let card = this.hand.find(c => c.id === cardId)
      card.selected = !card.selected
      this.hand.splice(
          this.hand.findIndex(c => c.id === cardId),
          1,
          card
      )
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
}

#upper-board {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 250px;
}

#lower-board {
  height: 250px;
}
</style>