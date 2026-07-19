import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getSalon } from '../api/business'
import { createAppointment, getPublicSlots } from '../api/booking'
import { ApiError } from '../api/http'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { formatEuro } from '../lib/formatEuro'

function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addMonths(d: Date, months: number): Date {
  const next = new Date(d)
  next.setMonth(next.getMonth() + months)
  return next
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('bg-BG', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Sofia',
  })
}

function formatDayLabel(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('bg-BG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Sofia',
  })
}

export function BookAppointmentPage() {
  const { id } = useParams<{ id: string }>()
  const salonId = Number(id)
  const [searchParams] = useSearchParams()
  const serviceId = Number(searchParams.get('serviceId'))
  const navigate = useNavigate()
  const { accessToken, user } = useAuth()

  const today = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])
  const horizonEnd = useMemo(() => addMonths(today, 1), [today])

  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(today))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const salonQuery = useQuery({
    queryKey: ['salon', salonId],
    queryFn: () => getSalon(salonId),
    enabled: Number.isFinite(salonId),
  })

  const rangeFrom = toIsoDate(today)
  const rangeTo = toIsoDate(horizonEnd)

  const slotsQuery = useQuery({
    queryKey: ['slots', salonId, serviceId, rangeFrom, rangeTo],
    queryFn: () => getPublicSlots(salonId, serviceId, rangeFrom, rangeTo),
    enabled: Number.isFinite(salonId) && Number.isFinite(serviceId),
  })

  const availableDates = useMemo(() => {
    const set = new Set<string>()
    for (const day of slotsQuery.data ?? []) {
      if (day.slots.length > 0) set.add(day.date)
    }
    return set
  }, [slotsQuery.data])

  const daySlots = useMemo(() => {
    if (!selectedDate) return []
    return slotsQuery.data?.find((d) => d.date === selectedDate)?.slots ?? []
  }, [slotsQuery.data, selectedDate])

  const service = useMemo(() => {
    for (const g of salonQuery.data?.serviceGroups ?? []) {
      const found = g.services.find((s) => s.id === serviceId)
      if (found) return found
    }
    return null
  }, [salonQuery.data, serviceId])

  const bookMutation = useMutation({
    mutationFn: () =>
      createAppointment(accessToken!, {
        salonId,
        serviceId,
        startsAt: selectedSlot!,
      }),
    onSuccess: () => {
      navigate(`/salons/${salonId}?booked=1`)
    },
  })

  const monthLabel = monthCursor.toLocaleDateString('bg-BG', {
    month: 'long',
    year: 'numeric',
  })

  const calendarCells = useMemo(() => {
    const first = startOfMonth(monthCursor)
    // Monday-first grid
    const weekday = (first.getDay() + 6) % 7
    const start = new Date(first)
    start.setDate(first.getDate() - weekday)
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [monthCursor])

  const canPrevMonth = startOfMonth(monthCursor) > startOfMonth(today)
  const canNextMonth = startOfMonth(monthCursor) < startOfMonth(horizonEnd)

  if (!Number.isFinite(salonId) || !Number.isFinite(serviceId)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-ink-secondary">Липсва услуга за резервация.</p>
        <Link to="/" className="mt-4 inline-block text-brand underline">
          Към началото
        </Link>
      </main>
    )
  }

  const isClient = user?.roles?.includes('CLIENT')

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link to={`/salons/${salonId}`} className="text-sm text-brand hover:underline">
        ← Назад към салона
      </Link>

      <header className="mt-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Запази час</h1>
        <p className="mt-1 text-ink-secondary">
          {salonQuery.data?.name ?? '…'}
          {service ? (
            <>
              {' '}
              · {service.name} · {service.durationMin} мин · {formatEuro(service.price)} €
            </>
          ) : null}
        </p>
        <p className="mt-2 text-xs text-ink-muted">
          Можете да запазвате от днес до {horizonEnd.toLocaleDateString('bg-BG')} включително.
        </p>
      </header>

      <section className="glass rounded-3xl p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={!canPrevMonth}
            onClick={() => setMonthCursor((m) => addMonths(m, -1))}
            aria-label="Предишен месец"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <h2 className="text-base font-semibold capitalize text-ink">{monthLabel}</h2>
          <Button
            type="button"
            variant="ghost"
            disabled={!canNextMonth}
            onClick={() => setMonthCursor((m) => addMonths(m, 1))}
            aria-label="Следващ месец"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-ink-muted">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((d) => {
            const iso = toIsoDate(d)
            const inMonth = d.getMonth() === monthCursor.getMonth()
            const inRange = d >= today && d <= horizonEnd
            const hasSlots = availableDates.has(iso)
            const selected = selectedDate === iso
            const disabled = !inRange || !hasSlots || slotsQuery.isLoading

            return (
              <button
                key={iso + String(inMonth)}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setSelectedDate(iso)
                  setSelectedSlot(null)
                }}
                className={[
                  'aspect-square rounded-2xl text-sm transition',
                  selected
                    ? 'bg-brand text-white shadow-md'
                    : hasSlots && inRange
                      ? 'bg-white/70 text-ink hover:bg-white'
                      : 'text-ink-muted opacity-40',
                  !inMonth ? 'opacity-30' : '',
                ].join(' ')}
              >
                {d.getDate()}
              </button>
            )
          })}
        </div>

        {slotsQuery.isLoading ? (
          <p className="mt-4 text-sm text-ink-muted">Зареждане на свободни часове…</p>
        ) : null}
      </section>

      {selectedDate ? (
        <section className="glass mt-6 rounded-3xl p-5 sm:p-6">
          <h3 className="mb-1 text-base font-semibold capitalize text-ink">
            {formatDayLabel(selectedDate)}
          </h3>
          <p className="mb-4 text-xs text-ink-muted">
            Без избран служител системата разпределя равномерно между свободните.
          </p>
          {daySlots.length === 0 ? (
            <p className="text-sm text-ink-muted">Няма свободни часове за този ден.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {daySlots.map((slot) => {
                const active = selectedSlot === slot.startsAt
                return (
                  <button
                    key={slot.startsAt}
                    type="button"
                    onClick={() => setSelectedSlot(slot.startsAt)}
                    className={[
                      'rounded-full px-4 py-2 text-sm font-medium transition',
                      active
                        ? 'bg-brand text-white shadow'
                        : 'bg-white/70 text-ink hover:bg-white',
                    ].join(' ')}
                  >
                    {formatSlotTime(slot.startsAt)}
                  </button>
                )
              })}
            </div>
          )}
        </section>
      ) : null}

      <div className="mt-6 space-y-3">
        {!accessToken ? (
          <p className="text-sm text-ink-secondary">
            За да запазите час,{' '}
            <Link to="/login" className="text-brand underline">
              влезте
            </Link>{' '}
            с клиентски акаунт (роля CLIENT).
          </p>
        ) : !isClient ? (
          <p className="text-sm text-danger">Само потребители с роля CLIENT могат да запазват час.</p>
        ) : null}

        {bookMutation.error ? (
          <p className="rounded-2xl bg-danger/10 px-3 py-2 text-sm text-danger">
            {bookMutation.error instanceof ApiError
              ? bookMutation.error.message
              : 'Неуспешна резервация'}
          </p>
        ) : null}

        <Button
          type="button"
          className="w-full sm:w-auto"
          disabled={
            !selectedSlot || !accessToken || !isClient || bookMutation.isPending || !service
          }
          onClick={() => bookMutation.mutate()}
        >
          {bookMutation.isPending ? 'Запазване…' : 'Потвърди резервацията'}
        </Button>
      </div>
    </main>
  )
}
