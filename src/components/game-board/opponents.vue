<template lang="pug">
  #opponents
    opponent(
      v-for="opponent in opponents"
      :key="opponent.username"
      :opponent="opponent"
      @opponent:click="onOpponentClick"
    )
</template>

<script>
import opponent from "./opponent.vue"

export default {
  name: "opponents",
  components: { opponent },
  props: ['opponents'],
  methods: {
    onOpponentClick(opponentUsername) {
      this.$emit('opponents:opponent-click', opponentUsername)
    },
  },
}
</script>

<style scoped>
#opponents {
  display: flex;
  flex-direction: row;
  width: 100%;
  min-height: 150px;
}
</style>