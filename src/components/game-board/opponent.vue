<template lang="pug">
  div(class="opponent")
    span(class="opponent-name") {{ opponent.username }}
    span(class="opponent-status") {{ opponent.disconnected ? 'Disconnected' : 'Connected' }}
    ul(class="played-cards")
      li(v-if="!opponent.playedCards.length") No played cards
      li(v-else v-for="card in opponent.playedCards") {{ card }}
</template>

<script>
export default {
  name: "opponent",
  props: ['opponent'],
}
</script>

<style scoped>
.opponent {
  border: 1px solid grey;
  border-radius: 5px;
  padding: 5px;
  width: 300px;
}

.opponent-name {
  font-size: 20px;
}

.opponent-status {
  font-size: 14px;
  float: right;
}

.played-cards {
  overflow-y: scroll;
  list-style: none;
}
</style>