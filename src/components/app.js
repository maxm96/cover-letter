import Vue from 'vue'

import gameBoard from './game-board/game-board.vue'

Vue.component('game-board', gameBoard)

const app = new Vue({
    el: '#app'
})