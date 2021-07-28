import Vue from 'vue'

import coverLetter from './cover-letter.vue'

Vue.component('cover-letter', coverLetter)

const app = new Vue({
    el: '#app'
})