import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '../services/dashboardService'

export const useDashboardStats = () =>
  useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
  })
