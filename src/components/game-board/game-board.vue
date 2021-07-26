<template lang="pug">
  #game-board
    #upper-board
      #scores
      #timer
      #messages
    p Hello world!
</template>

<script>
export default {
  name: "game-board",
  created() {
    console.log('Hello world!')
  }
}
</script>

<style scoped>
#game-board {
  background-color: blue;
  width: 100%;
  height: 100%;
  border: red 1px solid;
}
</style>