<template lang="pug">
  #messages(ref="messages" @mouseover="mouseHovering = true" @mouseleave="mouseHovering = false")
    p(v-for="message in messages" class="message") {{ message }}
</template>

<script>
export default {
  name: "messages",
  props: ['messages'],
  data() {
    return {
      mouseHovering: false,
    }
  },
  methods: {
    scrollToBottom() {
      this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
    },
  },
  watch: {
    messages() {
      // Do not scroll the messages if the user is hovering the mouse over the messages. This means they are likely
      // reading them.
      if (this.mouseHovering) {
        return
      }

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