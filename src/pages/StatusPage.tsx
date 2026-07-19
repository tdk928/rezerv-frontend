import { useAuth } from '../auth/AuthContext'

/** Черен екран със статус на сесията — нищо друго. */
export function StatusPage() {
  const { isAuthenticated, user } = useAuth()

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="glass-strong rounded-3xl px-8 py-10">
        <p className="text-center text-xl font-semibold tracking-tight text-ink">
          {isAuthenticated && user
            ? `Логнат си като ${user.firstName} ${user.lastName} (${user.email})`
            : 'Не си логнат'}
        </p>
      </div>
    </main>
  )
}
