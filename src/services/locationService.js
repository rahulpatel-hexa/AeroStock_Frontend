import api from './api'

export const getLocations = async (params = {}) => {
  const { data } = await api.get('/locations', {
    params: { limit: 100, ...params },
  })
  return data.data.items
}
