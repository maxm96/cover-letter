<template lang="pug">
  #help-modal(v-if="show" @click="onModalClick")
    div(id="help-modal-body" class="modal-body no-scrollbar")
      button(class="how-to-modal-close-btn" @click="close") &times; Close
      h4 Objective
      p
        | Your goal is to climb the corporate ladder to do the least amount of work for the highest pay.
        | Win the round by eliminating other players or ending the round with the highest value card.
        | Win a certain number of rounds to win the game! (2 players: 7 rounds, 3 players: 5 rounds, 4 players: 4 rounds)
      h4 Cards
      p
        | The game contains 16 cards. Each card has a name, a value (which is displayed in the upper left
        | corner), a description (which tells you how to play the card), and a count (displayed in parentheses
        | after the card name) that indicates how many times that card appears in the deck.
      dl
        dt 1 Wagie (5)
        dd
          | When you discard the Wagie, choose another player and name a card (that is not the Wagie). If
          | that player has the card you named, the player is out until the next round.

        dt 2 HR (2)
        dd When you discard the HR card, you can look at another player's hand. Do not reveal it to anyone else.

        dt 3 Shift Manager (2)
        dd
          | When you discard Shift Manager, choose another player. You and the chosen player will compare
          | hands. The player with the lowest value card is out. In the case of a tie, nothing happens.
          | If there are no available players to choose, you can discard this card.

        dt 4 Recommendation Letter (2)
        dd When you discard the Recommendation Letter, you gain immunity from other players' cards until your next turn.

        dt 5 Salaried Worker (2)
        dd
          | When you discard the Salaried Worker, choose another player (including yourself). That player
          | discards their hand (ignoring the effects) and draws a new card. If the deck is empty, the
          | player gets the card that was discarded at the beginning of the round. If all other players
          | are out or protected, the player must apply the card's effects to themself.

        dt 6 Motivational Speaker (1)
        dd
          | When you discard Motivational Speaker, choose another player. You will trade hands with the
          | chosen player. If all other players are out or protected, this card does nothing.

        dt 7 CEO (1)
        dd
          | This card has no effect when you discard it. You can discard it at any time. However, if you
          | ever have this card along with either the Motivational Speaker or Salaried Worker, you must
          | discard the CEO.

        dt 8 Shareholder (1)
        dd If you discard this card you are out.
      h4 Playing a card
      p
        | Click a card to play it. If the card requires a victim you will also need to select an opponent
        | to play the card against. If it is valid to play the card against yourself then a button will appear
        | to give you that option. You will have the option of discarding the card if there are no valid
        | victims.
      h4 How to play
      p
        | At the start of a round each player will be dealt 1 card. On your turn you will be dealt a second
        | card. You then must play 1 of the cards either applying the effects to an opponent or yourself or,
        | if neither option is valid, discard a card. The effects of the card are applied and it is then the
        | next person's turn. This goes until one person remains or until the deck runs out of cards at which
        | point the round ends, the winner gets a round point and either wins the game or another round starts.
        | The winner of a previous round goes first.
      button(class="how-to-modal-close-btn" @click="close") &times; Close
</template>

<script>
export default {
  name: "help-modal",
  props: ['show'],
  methods: {
    onModalClick(e) {
      // If clicking outside of the modal body, the user probably wants the modal to close
      if (e.target.id === 'help-modal') {
        this.close()
      }
    },
    close() {
      this.$emit('help-modal:close')
    },
  },
}
</script>

<style scoped>
#help-modal {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,.3)
}

#help-modal-body {
  background: white;
  width: 80%;
  max-height: 80%;
  margin: 5% auto;
  font-size: initial;
  font-weight: initial;
  overflow: scroll;
  border-radius: 5px;
  text-align: left;
}
</style>