import { useQuery } from '@tanstack/react-query'
import {
  getDashboardRecentActivity,
  getDashboardStats,
} from '../services/dashboardService'

export const useDashboardStats = () =>
  useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
  })

export const useDashboardRecentActivity = (limit = 5) =>
  useQuery({
    queryKey: ['dashboard', 'recent-activity', limit],
    queryFn: () => getDashboardRecentActivity(limit),
  })
