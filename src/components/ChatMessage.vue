<template>
  <div class="message-block" v-if="message.client_id == 0">
    Бот: {{ message.text }} / {{ (new Date(message.message_time)).toLocaleTimeString() }}
  </div>
  <div class="message-block" v-else>
    Клиент: {{ message.text }} / {{ (new Date(message.message_time)).toLocaleTimeString() }}
  </div>
</template>

<script setup>
defineProps({
  message: Object
})
</script>

<style lang="scss" scoped>
.message-block {
  display: flex;
}
</style>