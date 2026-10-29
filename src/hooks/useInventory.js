import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  createInventoryItem,
  importInventoryItems,
  updateInventoryItem,
  updateInventoryItemStatus,
  createStockMovement,
  getStockMovements,
  getItemStockMovements,
  getInventoryItems,
  getInventoryItem,
} from '../services/inventoryService'

export const useInventoryItems = (params = {}) =>
  useQuery({
    queryKey: ['inventory', params],
    queryFn: () => getInventoryItems(params),
  })

export const useStockMovements = (params = {}) =>
  useQuery({
    queryKey: ['stock-movements', params],
    queryFn: () => getStockMovements(params),
  })

export const useItemStockMovements = (id, params = {}) =>
  useQuery({
    queryKey: ['inventory', id, 'stock-movements', params],
    queryFn: () => getItemStockMovements(id, params),
    enabled: !!id,
  })

export const useInventoryItem = (id) =>
  useQuery({
    queryKey: ['inventory', id],
    queryFn: () => getInventoryItem(id),
    enabled: !!id,
  })

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Item added successfully')
    },
    onError: (error) => toast.error(error.message),
  })
}

export const useImportInventoryItems = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: importInventoryItems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Inventory imported successfully')
    },
    onError: (error) => toast.error(error.message),
  })
}

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Item updated successfully')
    },
    onError: (error) => toast.error(error.message),
  })
}

export const useUpdateInventoryItemStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateInventoryItemStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Item status updated')
    },
    onError: (error) => toast.error(error.message),
  })
}

export const useCreateStockMovement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createStockMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      toast.success('Stock transaction recorded')
    },
    onError: (error) => toast.error(error.message),
  })
}
