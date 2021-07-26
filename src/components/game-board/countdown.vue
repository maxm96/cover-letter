<template lang="pug">
  #countdown
    p {{ count }}
</template>

<script>
export default {
  name: "countdown",
  props: ['maxCount', 'doStart', 'doStop', 'doReset'],
  data() {
    return {
      count: this.maxCount,
      intervalHandle: null,
      hasEmittedFinish: false,
    }
  },
  methods: {
    start() {
      // Already started
      if (this.intervalHandle) {
        return
      }

      this.intervalHandle = setInterval(() => {
        if (this.count === 0) {
          if (!this.hasEmittedFinish) {
            this.onFinished()
          }

          clearInterval(this.intervalHandle)

          return
        }

        this.count--
      }, 1000)
    },
    stop() {
      clearInterval(this.intervalHandle)
      this.intervalHandle = null
    },
    reset() {
      this.count = this.maxCount
      this.hasEmittedFinish = false
    },
    onFinished() {
      this.$emit('countdown:finished')
      this.hasEmittedFinish = true
    },
  },
  watch: {
    doStart(newVal) {
      if (!newVal) {
        return
      }

      this.start()
    },
    doStop(newVal) {
      if (!newVal) {
        return
      }

      this.stop()
    },
    doReset(newVal) {
      if (!newVal) {
        return
      }

      this.reset()
    },
  },
  mounted() {
    this.start()
  },
}
</script>

<style scoped>
p {
  font-size: 24px;
}
</style>