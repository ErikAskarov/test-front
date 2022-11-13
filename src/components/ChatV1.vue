<template>
  <div class="chat-v1">
    <div class="chat-v1__emojis">
      <div class="emoji" v-for="emoji in emojis" :key="emoji.group">
        {{ emoji.listEmoji }}
      </div>
    </div>
    <div class="chat-v1__form">
      <input type="text" v-model="text">
      <button class="chat-v1__button" @click="sendMessage(text)">Отправить</button>
    </div>
    <chat-message v-for="message in messages" :message="message" :key="message.id"></chat-message>
    <div v-if="sessionAlert">
      {{ sessionAlert }}
    </div>
  </div>
</template>

<script setup>
import ChatMessage from './ChatMessage.vue';
import { ref } from 'vue';
import { createMessage, getAllMessage } from '../http/messageAPI';
import { createSession, getAllSession } from '../http/sessionAPI';

const message = ref(null);
const text = ref(null);
const messages = ref([]);
const emojis = [
  {
    group: 'Радость',
    listEmoji: ['😀', '😃', '😄', '😁', '😆', '😂', '😊', '🤩', '🥳']
  },
  {
    group: 'Грусть',
    listEmoji: ['😒', '😞', '😔', '😟', '😕', '🙁', '😩', '😫', '😓']
  },
  {
    group: 'Раздражение',
    listEmoji: ['👿', '😬', '😤', '😡', '👺', '💀', '😠', '🤯', '🤨']
  }
]
let id = ref(0);
let session_id = ref(0);
let client_id = ref(0);
let sessionStartTime = ref(0);
let sessionAlert = ref(null);
let timerId = ref(0);
let session = {
  id: null,
  start_session: null,
  end_session: null,
}

function sessionStart() { // Начало сессии
  sessionStartTime.value = (new Date()).getTime();
  setTimeout(findIndexLastSession(), 300);
  setTimeout(findIndexLastMessageClient(), 300);
};

function findIndexLastSession() { // Поиск id последней сессии
  getAllSession().then((data) => {
    session_id.value = data[data.length - 1].id;
  })
};
function findIndexLastMessageClient() { // Поиск id последнего клиента
  getAllMessage().then((data) => {
    client_id.value = data[data.length - 1].id;
  })
};

function sendMessage(text) { // Функция отправки сообщения
  sessionAlert.value = '';
  if (messages.value.length == 0) {
    sessionStart();
    session.start_session = sessionStartTime.value;
  }
  if (timerId.value != 0 && ((new Date()).getTime() - sessionStartTime.value < 60000)) {
    clearTimeout(timerId.value);
  }
  timerId.value = setTimeout(() => {
    sessionStart();
    sessionAlert.value = 'Беседа обнулилась';
    session.end_session = (new Date()).getTime();
    createSession({ end_session: session.end_session, start_session: session.start_session }).then((data) => { // Запись сессии в БД
      console.log('Сессия', data);
    }).catch((error) => {
      console.log(error.message);
    });
    messages.value = [];
  }, 1000 * 50)

  let messageClient = message.value = {
    message_time: (new Date()).getTime(),
    sessionId: session_id.value + 1,
    text: text,
    client_id: client_id.value + 1,
  };
  createMessage(messageClient).then((data) => { // Запись сообщения в БД
    console.log('Сообщение', data);
  }).catch((error) => {
    console.log(error.message);
  })
  messages.value.push(messageClient);
  checkMessage(text);
}

function findEmojiGroup(message) { // Определение группы смайлика
  let findGroup = emojis.find(emojiGroup => {
    return emojiGroup.listEmoji.includes(message)
  });
  let res = findGroup === undefined ? 'нераспознано' : findGroup.group;
  return res;
}

function checkMessage(text) { // Определение ответа сообщения для отправки нужного ответа ботом
  let lengthArray = Object.keys(messages.value).length;
  let groupEmojiLastMessage;
  if (lengthArray == 1) { // Ответ бота в случае, если контекста не было
    groupEmojiLastMessage = findEmojiGroup(text);
    console.log('ssssssssss', groupEmojiLastMessage);
    greeting(groupEmojiLastMessage);
  }
  else {
    let lastMessage = JSON.parse(JSON.stringify(messages.value))[lengthArray - 1];
    groupEmojiLastMessage = findEmojiGroup(lastMessage.text);
    let penultimateMessage = JSON.parse(JSON.stringify(messages.value))[lengthArray - 3] || 0;
    let groupEmojiPenultimateMessage = findEmojiGroup(penultimateMessage.text);
    setTimeout(() => {
      if (lastMessage.id == 1) {
        greeting(groupEmojiLastMessage);
      }
      else {
        if (groupEmojiPenultimateMessage == 'нераспознано') {
          basicReply(groupEmojiLastMessage);
        }
        else if (groupEmojiLastMessage == 'Радость') {
          funnyReply(groupEmojiPenultimateMessage);
        }
        else if (groupEmojiLastMessage == 'Грусть') {
          sadReply(groupEmojiPenultimateMessage);
        }
        else if (groupEmojiLastMessage == 'Раздражение') {
          angryReply(groupEmojiPenultimateMessage);
        }
        else {
          dialog('Я тебя не понимаю:((');
        }
      }
    }, 1000);
  }
}
function funnyReply(penultimateMessage) { // Веселый ответ
  if (penultimateMessage == 'Радость') {
    basicReply(penultimateMessage);
  }
  else if (penultimateMessage == 'Грусть') {
    dialog('Рад, что тебе стало лучше!')
  }
  else if (penultimateMessage == 'Раздражение') {
    dialog('Тебе стало значительно лучше!')
  }
}
function sadReply(penultimateMessage) { // Грустный ответ
  if (penultimateMessage == 'Радость') {
    dialog('Почему тебе стало грустно?')
  }
  else if (penultimateMessage == 'Грусть') {
    basicReply(penultimateMessage);
  }
  else if (penultimateMessage == 'Раздражение') {
    dialog('Теперь ты не злой, но грустный')
  }
}
function angryReply(penultimateMessage) { // Раздраженный ответ
  if (penultimateMessage == 'Радость') {
    dialog('Ты стал на что-то раздражен?')
  }
  else if (penultimateMessage == 'Грусть') {
    dialog('Кажется, тебе стало ещё хуже')
  }
  else if (penultimateMessage == 'Раздражение') {
    basicReply(penultimateMessage);
  }
}

function basicReply(text) { // Ответ без контекста
  if (text == 'Радость') {
    dialog('У тебя хорошее настроение!')
  }
  else if (text == 'Грусть') {
    dialog('Почему у тебя плохое настроение?')
  }
  else if (text == 'Раздражение') {
    dialog('Из-за чего ты зол?')
  }
  else {
    dialog('Я не понимаю текст:((')
  }
}

function greeting(text) { // Функция приветствия
  let greetingText = text == 'Радость' ? 'Привет, ты сегодня веселый!' :
    text == 'Грусть' ? 'Привет, ты сегодня грустный, что случилось?' :
      text == 'Раздражение' ? 'Привет, из-за чего ты раздражен?' :
        'Привет! Я тебя не понимаю:('
  console.log(greetingText);
  id.value = id.value + 1;
  message.value = {
    id: id.value,
    message_time: (new Date()).getTime(),
    session_id: 1,
    text: greetingText,
    client_id: 0,
  };
  messages.value.push(message.value);
}

function dialog(text) {
  id.value = id.value + 1;
  message.value = {
    id: id.value,
    message_time: (new Date()).getTime(),
    session_id: 1,
    text: text,
    client_id: 0,
  };
  messages.value.push(message.value);
}

</script>

<style lang="scss" scoped>
.chat-v1 {
  height: 100vh;
  padding-top: 100px;
  padding-left: 100px;

  .chat-v1__form {
    display: flex;
  }
}
.chat-v1__emojis {
  margin-bottom: 30px;
}
.chat-v1__button {
  margin-left: 10px;
}

.chat-v1__emoji-picker {
  width: 300px;
}
</style>