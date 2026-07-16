import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { refresh as refreshRequest, type AuthResponse, type UserResponse } from '../api/auth'
import { setUnauthorizedHandler } from '../api/http'

/**
 * Access token-ът живее САМО в паметта. Refresh token-ът се пази в sessionStorage,
 * за да преживее reload на страницата (бекендът го връща в JSON body, не в httpOnly
 * cookie — когато мине към cookie, sessionStorage отпада).
 */
const REFRESH_TOKEN_KEY = 'rezerv.refreshToken'

interface AuthState {
  accessToken: string | null
  user: UserResponse | null
  isAuthenticated: boolean
  setSession: (auth: AuthResponse) => void
  refreshSession: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isRestoring, setIsRestoring] = useState(
    () => sessionStorage.getItem(REFRESH_TOKEN_KEY) !== null,
  )

  const refreshTokenRef = useRef<string | null>(null)
  const restoreStartedRef = useRef(false)

  const setSession = useCallback((auth: AuthResponse) => {
    setAccessToken(auth.accessToken)
    setUser(auth.user)
    refreshTokenRef.current = auth.refreshToken
    sessionStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken)
  }, [])

  const logout = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    refreshTokenRef.current = null
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  }, [])

  const refreshSession = useCallback(async () => {
    const token = refreshTokenRef.current ?? sessionStorage.getItem(REFRESH_TOKEN_KEY)
    if (token === null) {
      throw new Error('Няма активна сесия')
    }
    const auth = await refreshRequest({ refreshToken: token })
    setSession(auth)
  }, [setSession])

  // Възстановяване на сесията след reload.
  useEffect(() => {
    // Guard срещу StrictMode double-invoke: rotation-ът инвалидира стария token,
    // втори паралелен refresh със същия token би върнал 401.
    if (restoreStartedRef.current) return
    restoreStartedRef.current = true

    const stored = sessionStorage.getItem(REFRESH_TOKEN_KEY)
    if (stored === null) {
      setIsRestoring(false)
      return
    }

    refreshRequest({ refreshToken: stored })
      .then(setSession)
      .catch(logout)
      .finally(() => setIsRestoring(false))
  }, [setSession, logout])

  // Gateway 401 (Invalid or expired token) на protected кол → logout.
  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  const value = useMemo<AuthState>(
    () => ({
      accessToken,
      user,
      isAuthenticated: accessToken !== null,
      setSession,
      refreshSession,
      logout,
    }),
    [accessToken, user, setSession, refreshSession, logout],
  )

  return <AuthContext value={value}>{isRestoring ? null : children}</AuthContext>
}

export function useAuth(): AuthState {
  const state = use(AuthContext)
  if (state === null) {
    throw new Error('useAuth трябва да се ползва вътре в <AuthProvider>')
  }
  return state
}
