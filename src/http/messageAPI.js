import { $host } from "./index";

export const getMessage = async () => {
  const { data } = await $host.get('api/message')
  return data
}

export const createMessage = async (message) => {
  console.log(message);
  const { data } = await $host.post('api/message', {
    message: message
  })
  console.log(data);
  return data
}