import api from './api'

export const getManufacturers = async (params = {}) => {
  const { data } = await api.get('/manufacturers', {
    params: { limit: 100, ...params },
  })
  return data.data.items
}
