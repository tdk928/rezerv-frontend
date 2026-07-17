import { Navigate, useLocation } from 'react-router'
import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'

/** Защита за роля — първо изисква login, после конкретна роля. */
export function RequireRole({ role, children }: { role: string; children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!(user?.roles ?? []).includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}
