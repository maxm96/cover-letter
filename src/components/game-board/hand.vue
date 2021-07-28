<template lang="pug">
  #hand
    div(v-for="card in cards" class="card" @click="onCardClick(card.id)" :class="{ selected: card.selected }")
      span(class="card-number") {{ card.number }}
      span(class="card-name") {{ card.name }}
      span(class="card-count") ({{ card.count }})
      img(class="card-picture")
      p(class="card-description") {{ card.description }}
      input(class="requires-victim" hidden="true" :value="card.requiresVictim")
      input(class="against-self" hidden="true" :value="card.canPlayAgainstSelf")
</template>

<script>
export default {
  name: "hand",
  props: ['cards'],
  methods: {
    onCardClick(cardId) {
      this.$emit('hand:card-click', cardId)
    },
  },
}
</script>

<style scoped>
#hand {
  display: flex;
  flex: 2;
  justify-content: flex-end;
  height: 100%;
}

.card {
  height: 100%;
  width: 30%;
  max-height: 275px;
  max-width: 240px;
  border: 1px solid grey;
  padding: 4px;
  margin-left: 2px;
  animation: fadein 1s;
  cursor: pointer;
}

.card-name {
  margin-left: 10px;
}

.card-picture {
  margin-top: 10px;
  margin-bottom: 10px;
}

.selected {
  background-color: black;
  color: white;
}

@keyframes fadein {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 100%;
  }
}
</style>