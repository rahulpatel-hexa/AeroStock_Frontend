import api from './api'

export const loginApi = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials)

  // API response: { success, message, data: { token, user } }
  return {
    token: data.data.token,
    user: data.data.user,
  }
}

export const updateMeApi = async ({ name }) => {
  const { data } = await api.put('/auth/me', { name })
  return data.data.user
}

export const changePasswordApi = async (payload) => {
  const { data } = await api.put('/auth/change-password', payload)
  return data
}