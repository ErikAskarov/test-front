import { $host } from "./index";

export const getAllSession = async () => {
  const { data } = await $host.get('api/session')
  return data
}

export const createSession = async (session) => {
  console.log(session);
  const { data } = await $host.post('api/session', {
    start_session: session.start_session,
    end_session: session.end_session
  })
  console.log(data);
  return data
}