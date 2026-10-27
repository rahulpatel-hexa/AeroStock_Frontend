import { useQuery } from '@tanstack/react-query'
import { getManufacturers } from '../services/manufacturerService'

export const useManufacturers = (params = {}) =>
  useQuery({
    queryKey: ['manufacturers', params],
    queryFn: () => getManufacturers(params),
  })
