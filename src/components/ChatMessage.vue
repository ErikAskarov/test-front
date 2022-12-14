<template>
  <div class="message-block" v-if="message.client_id == 0">
    <img src='@/assets/avatar_bot.png' alt="" height="30" width="30">
    <span>{{ message.mes }}</span>
  </div>
  <div class="message-block" v-else>
    <img src='@/assets/avatar_user.png' alt="" height="30" width="30">
    <img height="200" width="200" :src="image" alt="">
  </div>
</template>

<script setup>
import { onMounted, onUpdated, ref } from 'vue';

const image = ref(null)
const props = defineProps(['message'])

onMounted(() => {
  showImage()
})

function showImage() {
  let f = props.message.mes
  if (f !== String) {
    console.log(f);
    let reader = new FileReader();
    reader.onloadend = function () {
      image.value = reader.result;
    }
    if (f) {
      reader.readAsDataURL(f);
    } else {
      image.value = "";
    }
  }
}
</script>

<style lang="scss" scoped>
.message-block {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
}
</style>