import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, UserRound } from 'lucide-react'
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
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null)
  const [staffFilterId, setStaffFilterId] = useState<number | null>(null)

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

  const availableStaff = useMemo(() => {
    const byId = new Map<number, string>()
    for (const day of slotsQuery.data ?? []) {
      for (const slot of day.slots) {
        for (const staff of slot.staff) byId.set(staff.id, staff.displayName)
      }
    }
    return [...byId.entries()]
      .map(([id, displayName]) => ({ id, displayName }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'bg'))
  }, [slotsQuery.data])

  const visibleSlotDays = useMemo(() => {
    if (staffFilterId === null) return slotsQuery.data ?? []
    return (slotsQuery.data ?? [])
      .map((day) => ({
        ...day,
        slots: day.slots
          .filter((slot) => slot.staffIds.includes(staffFilterId))
          .map((slot) => ({
            ...slot,
            staffIds: slot.staffIds.filter((id) => id === staffFilterId),
            staff: slot.staff.filter((staff) => staff.id === staffFilterId),
          })),
      }))
      .filter((day) => day.slots.length > 0)
  }, [slotsQuery.data, staffFilterId])

  const availableDates = useMemo(() => {
    const set = new Set<string>()
    for (const day of visibleSlotDays) {
      if (day.slots.length > 0) set.add(day.date)
    }
    return set
  }, [visibleSlotDays])

  const daySlots = useMemo(() => {
    if (!selectedDate) return []
    return visibleSlotDays.find((d) => d.date === selectedDate)?.slots ?? []
  }, [visibleSlotDays, selectedDate])

  const selectedSlotDetails = useMemo(
    () => daySlots.find((slot) => slot.startsAt === selectedSlot) ?? null,
    [daySlots, selectedSlot],
  )

  function applyStaffFilter(staffId: number | null) {
    setStaffFilterId(staffId)
    setSelectedSlot(null)
    setSelectedStaffId(null)
  }

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
        staffId: selectedStaffId!,
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
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Link to={`/salons/${salonId}`} className="text-sm text-brand hover:underline">
        ← Назад към салона
      </Link>

      <header className="mt-4 mb-6">
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

      <section className="glass-strong overflow-hidden rounded-[2rem] p-2 sm:p-3">
        <div className="mb-2 rounded-[1.4rem] border border-white/55 bg-white/30 px-3 py-3 backdrop-blur-xl sm:px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex shrink-0 items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-soft text-brand">
                <UserRound className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Предпочитан служител</p>
                <p className="text-xs text-ink-muted">Филтрира свободните дати и часове.</p>
              </div>
            </div>

            <div
              className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-0.5 sm:justify-end"
              role="radiogroup"
              aria-label="Филтър по служител"
            >
              <button
                type="button"
                role="radio"
                aria-checked={staffFilterId === null}
                aria-label="Покажи всички служители"
                onClick={() => applyStaffFilter(null)}
                className={[
                  'shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold ring-1 ring-inset ring-white/55 transition-all',
                  staffFilterId === null
                    ? 'border-brand/20 bg-brand/10 text-brand shadow-sm shadow-brand/10'
                    : 'border-white/60 bg-white/50 text-ink-secondary hover:bg-white/85',
                ].join(' ')}
              >
                Всички
              </button>
              {availableStaff.map((staff) => {
                const active = staffFilterId === staff.id
                return (
                  <button
                    key={staff.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={`Покажи графика на ${staff.displayName}`}
                    onClick={() => applyStaffFilter(staff.id)}
                    className={[
                      'shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold ring-1 ring-inset ring-white/55 transition-all',
                      active
                        ? 'border-brand/20 bg-brand/10 text-brand shadow-sm shadow-brand/10'
                        : 'border-white/60 bg-white/50 text-ink-secondary hover:bg-white/85',
                    ].join(' ')}
                  >
                    {staff.displayName}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-2 lg:grid-cols-[minmax(21rem,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-[1.6rem] border border-white/60 bg-white/30 p-4 shadow-sm shadow-black/[0.03] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                className="!size-9 !p-0"
                disabled={!canPrevMonth}
                onClick={() => setMonthCursor((m) => addMonths(m, -1))}
                aria-label="Предишен месец"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <h2 className="text-sm font-semibold capitalize text-ink">{monthLabel}</h2>
              <Button
                type="button"
                variant="ghost"
                className="!size-9 !p-0"
                disabled={!canNextMonth}
                onClick={() => setMonthCursor((m) => addMonths(m, 1))}
                aria-label="Следващ месец"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-ink-muted">
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
                      setSelectedStaffId(null)
                    }}
                    className={[
                      'h-9 rounded-xl text-xs font-medium ring-1 ring-inset ring-transparent transition-all sm:h-10',
                      selected
                        ? 'bg-brand text-white shadow-md shadow-brand/25'
                        : hasSlots && inRange
                          ? 'bg-white/60 text-ink ring-white/55 hover:bg-white/90 hover:shadow-sm'
                          : 'text-ink-muted opacity-35',
                      !inMonth ? 'opacity-25' : '',
                    ].join(' ')}
                  >
                    {d.getDate()}
                  </button>
                )
              })}
            </div>

            {slotsQuery.isLoading ? (
              <p className="mt-3 text-center text-xs text-ink-muted">Зареждане на свободни часове…</p>
            ) : null}
          </div>

          <div className="flex min-h-[25rem] flex-col rounded-[1.6rem] border border-white/60 bg-white/45 p-4 shadow-sm shadow-black/[0.03] backdrop-blur-2xl sm:p-5">
            <div className="flex-1">
              {selectedDate ? (
                <>
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-full bg-brand-soft text-brand">
                      <CalendarDays className="size-4" />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                        Избрана дата
                      </p>
                      <h3 className="text-base font-semibold capitalize text-ink">
                        {formatDayLabel(selectedDate)}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2.5 flex items-center gap-2">
                      <Clock3 className="size-4 text-brand" />
                      <h4 className="text-sm font-semibold text-ink">Свободни часове</h4>
                    </div>
                    {daySlots.length === 0 ? (
                      <p className="text-sm text-ink-muted">Няма свободни часове за този ден.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
                        {daySlots.map((slot) => {
                          const active = selectedSlot === slot.startsAt
                          return (
                            <button
                              key={slot.startsAt}
                              type="button"
                              onClick={() => {
                                setSelectedSlot(slot.startsAt)
                                setSelectedStaffId(slot.staff.length === 1 ? slot.staff[0]!.id : null)
                              }}
                              className={[
                                'rounded-xl border px-3 py-2.5 text-sm font-semibold tabular-nums transition-all',
                                active
                                  ? 'border-brand/30 bg-brand text-white shadow-md shadow-brand/20'
                                  : 'border-white/60 bg-white/55 text-ink hover:bg-white/90 hover:shadow-sm',
                              ].join(' ')}
                            >
                              {formatSlotTime(slot.startsAt)}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {selectedSlotDetails ? (
                    <div className="mt-5 border-t border-line pt-4">
                      <div className="mb-2.5 flex items-center gap-2">
                        <UserRound className="size-4 text-brand" />
                        <div>
                          <h4 className="text-sm font-semibold text-ink">Служител</h4>
                          <p className="text-xs text-ink-muted">
                            {selectedSlotDetails.staff.length === 1
                              ? 'Единственият свободен е избран автоматично.'
                              : 'Изберете точно един свободен служител.'}
                          </p>
                        </div>
                      </div>

                      {selectedSlotDetails.staff.length > 0 ? (
                        <div
                          className="grid gap-2 sm:grid-cols-2"
                          role="radiogroup"
                          aria-label="Налични служители"
                        >
                          {selectedSlotDetails.staff.map((staff) => {
                            const selected = selectedStaffId === staff.id
                            return (
                              <button
                                key={staff.id}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => setSelectedStaffId(staff.id)}
                                className={[
                                  'flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left ring-1 ring-inset ring-white/50 transition-all',
                                  selected
                                    ? 'border-brand/20 bg-brand/10 text-ink shadow-sm shadow-brand/10'
                                    : 'border-white/60 bg-white/50 text-ink hover:bg-white/85',
                                ].join(' ')}
                              >
                                <span
                                  aria-hidden
                                  className={[
                                    'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                    selected ? 'bg-brand text-white' : 'bg-brand-soft text-brand',
                                  ].join(' ')}
                                >
                                  {selected ? '✓' : staff.displayName.slice(0, 1).toUpperCase()}
                                </span>
                                <span className="text-sm font-semibold">{staff.displayName}</span>
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-danger">Няма свободен служител за избрания час.</p>
                      )}

                      {selectedSlotDetails.staff.length > 1 && selectedStaffId === null ? (
                        <p className="mt-2 text-sm text-danger">Изберете точно един служител.</p>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <CalendarDays className="size-5" />
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-ink">Изберете дата</h3>
                  <p className="mt-1 max-w-xs text-sm text-ink-muted">
                    След това тук ще видите свободните часове и служители.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-3 border-t border-line pt-4">
              {!accessToken ? (
                <p className="text-sm text-ink-secondary">
                  За да запазите час,{' '}
                  <Link to="/login" className="text-brand underline">
                    влезте
                  </Link>{' '}
                  с клиентски акаунт.
                </p>
              ) : !isClient ? (
                <p className="text-sm text-danger">Само клиенти могат да запазват час.</p>
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
                className="w-full"
                disabled={
                  !selectedSlot ||
                  selectedStaffId === null ||
                  !accessToken ||
                  !isClient ||
                  bookMutation.isPending ||
                  !service
                }
                onClick={() => bookMutation.mutate()}
              >
                {bookMutation.isPending ? 'Запазване…' : 'Потвърди резервацията'}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
