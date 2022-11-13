import { $host } from "./index";

export const getAllMessage = async () => {
  const { data } = await $host.get('api/message')
  return data
}

export const createMessage = async (message) => {
  console.log(message);
  const { data } = await $host.post('api/message', {
    message_time: message.message_time,
    text: message.text,
    client_id: message.client_id,
    sessionId: message.sessionId
  })
  console.log(data);
  return data
}