import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = useAuthStore((s) => s.token)
  const role = useAuthStore((s) => s.user?.role)

  if (!token) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

