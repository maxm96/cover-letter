<template lang="pug">
  #opponents
    opponent(v-for="opponent in opponents" :key="opponent.username" :opponent="opponent")
</template>

<script>
import opponent from "./opponent.vue"

export default {
  name: "opponents",
  components: { opponent },
  props: ['opponents']
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