import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
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

/**
 * Споделен promise за session restore — без него React StrictMode (dev) пуска
 * два паралелни refresh със същия token; rotation-ът прави втория 401 → logout.
 */
let restoreInFlight: Promise<AuthResponse> | null = null

/** Само за тестове — нулира module-level restore между case-ове. */
export function resetAuthModuleStateForTests(): void {
  restoreInFlight = null
}

interface AuthState {
  accessToken: string | null
  user: UserResponse | null
  isAuthenticated: boolean
  setSession: (auth: AuthResponse) => void
  refreshSession: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

function normalizeAuth(auth: AuthResponse): AuthResponse {
  return {
    ...auth,
    user: {
      ...auth.user,
      companyIds: auth.user.companyIds ?? [],
    },
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isRestoring, setIsRestoring] = useState(
    () => sessionStorage.getItem(REFRESH_TOKEN_KEY) !== null,
  )

  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    sessionStorage.getItem(REFRESH_TOKEN_KEY),
  )

  const setSession = useCallback((auth: AuthResponse) => {
    const normalized = normalizeAuth(auth)
    setAccessToken(normalized.accessToken)
    setUser(normalized.user)
    setRefreshToken(normalized.refreshToken)
    sessionStorage.setItem(REFRESH_TOKEN_KEY, normalized.refreshToken)
  }, [])

  const logout = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    setRefreshToken(null)
    restoreInFlight = null
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  }, [])

  const refreshSession = useCallback(async () => {
    const token = refreshToken ?? sessionStorage.getItem(REFRESH_TOKEN_KEY)
    if (token === null) {
      throw new Error('Няма активна сесия')
    }
    const auth = await refreshRequest({ refreshToken: token })
    setSession(auth)
  }, [refreshToken, setSession])

  // Възстановяване на сесията след reload (един in-flight refresh за целия модул).
  useEffect(() => {
    const stored = sessionStorage.getItem(REFRESH_TOKEN_KEY)
    if (stored === null) {
      setIsRestoring(false)
      return
    }

    if (restoreInFlight === null) {
      restoreInFlight = refreshRequest({ refreshToken: stored }).finally(() => {
        restoreInFlight = null
      })
    }

    let cancelled = false
    restoreInFlight
      .then((auth) => {
        if (!cancelled) setSession(auth)
      })
      .catch(() => {
        if (!cancelled) logout()
      })
      .finally(() => {
        if (!cancelled) setIsRestoring(false)
      })

    return () => {
      cancelled = true
    }
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
