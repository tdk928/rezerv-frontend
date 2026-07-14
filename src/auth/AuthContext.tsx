import { createContext, use, useMemo, useState, type ReactNode } from 'react'
import type { AuthResponse, UserResponse } from '../api/auth'

interface AuthState {
  /** Access token се пази САМО в паметта — никога в localStorage. */
  accessToken: string | null
  user: UserResponse | null
  isAuthenticated: boolean
  setSession: (auth: AuthResponse) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserResponse | null>(null)

  const value = useMemo<AuthState>(
    () => ({
      accessToken,
      user,
      isAuthenticated: accessToken !== null,
      setSession: (auth) => {
        setAccessToken(auth.accessToken)
        setUser(auth.user)
      },
    }),
    [accessToken, user],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthState {
  const state = use(AuthContext)
  if (state === null) {
    throw new Error('useAuth трябва да се ползва вътре в <AuthProvider>')
  }
  return state
}
