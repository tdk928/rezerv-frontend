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

/**
 * Access token-ът живее САМО в паметта. Refresh token-ът се пази в sessionStorage,
 * за да преживее reload на страницата (бекендът го връща в JSON body, не в httpOnly
 * cookie — когато мине към cookie, sessionStorage отпада).
 */
const REFRESH_TOKEN_KEY = 'rezerv.refreshToken'

/** Sliding session: клик рефрешва token-а (+15 мин), но най-много веднъж в минута. */
const SLIDE_THROTTLE_MS = 60_000

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
  const lastRefreshAtRef = useRef(0)
  const refreshInFlightRef = useRef(false)
  const restoreStartedRef = useRef(false)

  const setSession = useCallback((auth: AuthResponse) => {
    setAccessToken(auth.accessToken)
    setUser(auth.user)
    refreshTokenRef.current = auth.refreshToken
    lastRefreshAtRef.current = Date.now()
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
    if (stored === null) return

    refreshRequest({ refreshToken: stored })
      .then(setSession)
      .catch(logout)
      .finally(() => setIsRestoring(false))
  }, [setSession, logout])

  // Sliding session: всеки клик (throttle 1 мин) издава нов access token за +15 мин.
  useEffect(() => {
    const onClick = () => {
      const token = refreshTokenRef.current
      if (token === null || refreshInFlightRef.current) return
      if (Date.now() - lastRefreshAtRef.current < SLIDE_THROTTLE_MS) return

      refreshInFlightRef.current = true
      refreshRequest({ refreshToken: token })
        .then(setSession)
        .catch(logout)
        .finally(() => {
          refreshInFlightRef.current = false
        })
    }

    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [setSession, logout])

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
