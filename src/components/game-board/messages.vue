<template lang="pug">
  #messages(ref="messages")
    p(v-for="message in messages" class="message") {{ message }}
</template>

<script>
export default {
  name: "messages",
  props: ['messages'],
  methods: {
    scrollToBottom() {
      this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
    },
  },
  watch: {
    messages() {
      // Must wait for the dom to render the next message before scrolling to it
      this.$nextTick(() => this.scrollToBottom())
    },
  },
  mounted() {
    this.scrollToBottom()
  },
}
</script>

<style scoped>
#messages {
  height: 100%;
  width: 40%;
  overflow-y: scroll;
  border: black 2px solid;
  padding-left: 4px;
}

.message {
  font-size: 14px;
  margin-top: 0;
  margin-bottom: 3px;
  padding: 1px;
}

.message:nth-of-type(odd) {
  background-color: #cbcbcb;
}
</style>