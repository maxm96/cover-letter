<template lang="pug">
  #lobby
    table(id="ready-board")
      thead
        tr
          th(id="username") Username
          th(id="ready") Ready
      tbody
        tr(v-for="player in players" class="ready-board-row")
          td(class="ready-board-username") {{ player.username }}
          td(class="ready-board-ready") {{ player.ready ? 'Yes' : 'No' }}

    label(for="ready-btn") Ready
    input(type="checkbox" id="ready-btn" :value="ready" @click="onReadyClick")

    br
    button(id="help-btn" class="q-mark" @click="toggleHelpModal") How to play

    countdown(v-if="showCountdown" :max-count="5")

    help-modal(:show="showHelpModal" @help-modal:close="toggleHelpModal")
</template>

<script>
import helpModal from "./help-modal.vue"
import countdown from "../countdown.vue"

export default {
  name: "lobby",
  components: { helpModal, countdown },
  props: ['players', 'ready', 'showCountdown'],
  data() {
    return {
      showHelpModal: false,
    }
  },
  methods: {
    onReadyClick(e) {
      this.$emit('lobby:ready-click', e.target.checked)
    },
    toggleHelpModal() {
      this.showHelpModal = !this.showHelpModal
    },
  },
}
</script>

<style scoped>
#help-btn {
  justify-content: center;
  margin-top: 20px;
}
</style>