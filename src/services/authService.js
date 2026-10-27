import api from './api'

export const loginApi = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials)

  // API response: { success, message, data: { token, user } }
  return {
    token: data.data.token,
    user: data.data.user,
  }
}