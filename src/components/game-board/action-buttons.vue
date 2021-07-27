<template lang="pug">
  #action-buttons
    button(id="play-btn" @click="onPlayButtonClick" v-if="showPlayButton") Play
    button(id="discard-btn" @click="onDiscardButtonClick" v-if="showDiscardButton") Discard
    button(id="against-self-btn" @click="onAgainstSelfButtonClick" v-if="showAgainstSelfButton") Play against self
</template>

<script>
export default {
  name: "action-buttons",
  props: ['showPlayButton', 'showDiscardButton', 'showAgainstSelfButton'],
  methods: {
    onPlayButtonClick() {
      this.$emit('action-buttons:play-button-click')
    },
    onDiscardButtonClick() {
      this.$emit('action-buttons:discard-button-click')
    },
    onAgainstSelfButtonClick() {
      this.$emit('action-buttons:against-self-button-click')
    },
  },
}
</script>

<style scoped>

</style>