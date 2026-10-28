import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getUsersPage, getUser, createUser, updateUser } from '../services/userService'

export const useUsersPage = (params = {}) =>
  useQuery({
    queryKey: ['users', 'page', params],
    queryFn: () => getUsersPage(params),
  })

export const useUser = (id) =>
  useQuery({
    queryKey: ['users', id],
    queryFn: () => getUser(id),
    enabled: !!id,
  })

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created')
    },
    onError: (error) => toast.error(error.message),
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated')
    },
    onError: (error) => toast.error(error.message),
  })
}
