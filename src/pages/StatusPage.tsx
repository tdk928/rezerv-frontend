import { useAuth } from '../auth/AuthContext'

/** Черен екран със статус на сесията — нищо друго. */
export function StatusPage() {
  const { isAuthenticated, user } = useAuth()

  return (
    <main className="flex flex-1 items-center justify-center bg-surface px-4">
      <p className="text-center text-2xl font-semibold text-ink">
        {isAuthenticated && user
          ? `Логнат си като ${user.firstName} ${user.lastName} (${user.email})`
          : 'Не си логнат'}
      </p>
    </main>
  )
}
