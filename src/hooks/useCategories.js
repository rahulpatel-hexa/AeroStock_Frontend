import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubCategories,
  getAllSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '../services/categoryService'

// Common mutation: success pe list refresh + toast, fail pe error toast
const useCrudMutation = (mutationFn, queryKey, successMessage) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      toast.success(successMessage)
    },
    onError: (error) => toast.error(error.message),
  })
}

// ---------- Categories ----------
// export const useCategories = () =>
//   useQuery({ queryKey: ['categories'], queryFn: getCategories })

export const useAllCategories = () =>
  useQuery({
    queryKey: ['categories', 'all'],
    queryFn: getAllCategories,
  })

export const useCategories = (params = {}) =>
  useQuery({
    queryKey: ['categories', params],
    queryFn: async () => {
      const items = await getCategories(params)
      return items.filter((c) => c.parentId === null)
    },
  })

export const useCreateCategory = () =>
  useCrudMutation(createCategory, ['categories'], 'Category created')

export const useUpdateCategory = () =>
  useCrudMutation(updateCategory, ['categories'], 'Category updated')

export const useDeleteCategory = () =>
  useCrudMutation(deleteCategory, ['categories'], 'Category deleted')

// ---------- Sub categories ----------
export const useSubCategories = (categoryId, params = {}) =>
  useQuery({
    queryKey: ['subcategories', categoryId, params],
    queryFn: () => getSubCategories(categoryId, params),
    enabled: !!categoryId,
  })

export const useAllSubCategories = (categoryId) =>
  useQuery({
    queryKey: ['subcategories', 'all', categoryId],
    queryFn: () => getAllSubCategories(categoryId),
    enabled: !!categoryId,
  })

export const useCreateSubCategory = () =>
  useCrudMutation(createSubCategory, ['subcategories'], 'Subcategory created')

export const useUpdateSubCategory = () =>
  useCrudMutation(updateSubCategory, ['subcategories'], 'Subcategory updated')

export const useDeleteSubCategory = () =>
  useCrudMutation(deleteSubCategory, ['subcategories'], 'Subcategory deleted')