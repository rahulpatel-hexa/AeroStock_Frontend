import { useQuery } from '@tanstack/react-query'
import { getLocations } from '../services/locationService'

export const useLocations = (params = {}) =>
  useQuery({
    queryKey: ['locations', params],
    queryFn: () => getLocations(params),
  })
