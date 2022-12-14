<template>
  <div class="chat-v1">
    <div class="chat">
      <div class="chat-v1__main">
        <chat-message v-for="message in messages" :message="message" :key="message.id"></chat-message>
      </div>
      <div class="chat-v1__form">
        <label class="chat-v1__input">
          <input c type="file" ref="file" @change="uploadFile($event)" />
        </label>
        <button class="chat-v1__button" @click="sendMessage()">Отправить</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import ChatMessage from './ChatMessage.vue';
import { ref } from 'vue';
import { createMessage } from '@/http/messageAPI'

const file = ref(null);
const messages = ref([]);
const imagePreview = ref(null)
let message = {
  client_id: 1,
  mes: ""
}

function uploadFile(event) {
  file.value = event.target.files[0];
  console.log(file.value);
}

function sendMessage() { // Функция отправки сообщения
  let f = file.value.files[0];
  createMessage(f).then((data) => {
    message = {
      client_id: 1,
      mes: f
    }
    messages.value.push(message);
    console.log(f);
    getMessage().then((data) => {
      message = {
        client_id: 0,
        mes: data
      }
      messages.value.push(message);
    }).catch((error) => {
      console.log(error.message);
    })
  }).catch((error) => {
    console.log(error.message);
  })
}

</script>

<style lang="scss" scoped>
.chat-v1 {
  display: flex;
  height: 100vh;
  align-items: center;
  justify-content: center;

  .chat-v1__form {
    display: flex;
    height: 25px;
  }
}

.chat {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 500px;
  width: 500px;
  border: 10px solid #FFFFFF;
  border-radius: 15px;
  padding: 15px;
}

.chat-v1__main {
  overflow-y: auto;
  height: 100%;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #6C77FF;
    border-radius: 5px;
  }
}

.chat-v1__input {
  border-radius: 10px;
  border: none;
  padding-left: 10px;
  width: 100%;
}

.chat-v1__button {
  width: 200px;
  margin-left: 10px;
  background-color: #FD9726;
  color: #F5F7FB;
  border-radius: 5px;
  border: none;
}
</style>