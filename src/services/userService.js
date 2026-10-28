import api from './api'

const unwrapList = (payload) => {
  if (Array.isArray(payload)) return { items: payload, pagination: {} }
  return {
    items: payload?.items ?? payload?.users ?? [],
    pagination: payload?.pagination ?? {},
  }
}

// List API: GET /users?page&limit → data.data.items + data.data.pagination
export const getUsersPage = async (params = {}) => {
  const { data } = await api.get('/users', {
    params: { page: 1, limit: 10, ...params },
  })
  return unwrapList(data.data)
}

// Detail API: data.data.user
export const getUser = async (id) => {
  const { data } = await api.get(`/users/${id}`)
  return data.data.user ?? data.data
}

export const createUser = async (payload) => {
  const { data } = await api.post('/users', payload)
  return data.data.user ?? data.data
}

export const updateUser = async ({ id, ...payload }) => {
  const { data } = await api.put(`/users/${id}`, payload)
  return data.data.user ?? data.data
}

export const updateUserStatus = async ({ id, isActive }) => {
  const path = isActive ? `/users/${id}/activate` : `/users/${id}/deactivate`
  const { data } = await api.patch(path)
  return data.data.user ?? data.data
}
