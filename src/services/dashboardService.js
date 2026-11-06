import api from './api'

export const getDashboardStats = async () => {
  const { data } = await api.get('/dashboard/stats')
  return data.data
}

export const getDashboardRecentActivity = async (limit = 5) => {
  const { data } = await api.get('/dashboard/recent-activity', {
    params: { limit },
  })
  return data.data.items ?? []
}
