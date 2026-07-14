import { useAuth } from '../auth/AuthContext'

/** Черен екран със статус на сесията — нищо друго. */
export function StatusPage() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <p className="text-2xl font-semibold text-white">
        {isAuthenticated && user
          ? `Логнат си като ${user.firstName} ${user.lastName} (${user.email})`
          : 'Не си логнат'}
      </p>
    </div>
  )
}
