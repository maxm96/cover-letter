<template lang="pug">
  #score-board
    div(v-for="player in players" class="player")
      span(class="player-name") {{ player.name }}
      span(class="player-score") {{ player.score }}
</template>

<script>
export default {
  name: "score-board",
  props: ['players'],
}
</script>

<style scoped>
#score-board {
  width: 20%;
}

.player {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
}

.player:nth-child(odd) {
  background-color: #999999;
}
</style>