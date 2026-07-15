import { Navigate, useLocation } from 'react-router'
import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
