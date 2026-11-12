import api from './api'
import API from './apiEndpoints'

export const getDashboardStats = async () => {
  const { data } = await api.get(API.DASHBOARD.STATS)
  return data.data
}

export const getDashboardRecentActivity = async (limit = 5) => {
  const { data } = await api.get(API.DASHBOARD.RECENT_ACTIVITY, {
    params: { limit },
  })
  return data.data.items ?? []
}
