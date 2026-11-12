import api from './api'
import API from './apiEndpoints'

export const loginApi = async (credentials) => {
  const { data } = await api.post(API.AUTH.LOGIN, credentials)

  // API response: { success, message, data: { token, user } }
  return {
    token: data.data.token,
    user: data.data.user,
  }
}

export const updateMeApi = async ({ name }) => {
  const { data } = await api.put(API.AUTH.ME, { name })
  return data.data.user
}

export const changePasswordApi = async (payload) => {
  const { data } = await api.put(API.AUTH.CHANGE_PASSWORD, payload)
  return data
}