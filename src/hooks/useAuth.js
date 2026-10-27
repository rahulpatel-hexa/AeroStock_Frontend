import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { loginApi } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: loginApi,
    onSuccess: ({ token, user }) => {
      setAuth({ user, token })
      toast.success('Login successful')
      navigate('/dashboard', { replace: true })
    },
    onError: (error) => {
      toast.error(error.message) // api.js ne already clean message bana diya hai
    },
  })
}