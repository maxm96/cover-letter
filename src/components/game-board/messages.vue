<template lang="pug">
  #messages
    p(v-for="message in messages" class="message") {{ message }}
</template>

<script>
export default {
  name: "messages",
  props: ['messages']
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