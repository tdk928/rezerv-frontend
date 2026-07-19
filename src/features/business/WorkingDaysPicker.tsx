import { WEEKDAYS, type DayHoursState } from './workingDays'

type Props = {
  value: Record<number, DayHoursState>
  onChange: (dayOfWeek: number, patch: Partial<DayHoursState>) => void
  onApplyPreset?: (next: Record<number, DayHoursState>) => void
  error?: string
}

function applyPreset(
  mode: 'weekdays' | 'withSat' | 'all',
  current: Record<number, DayHoursState>,
): Record<number, DayHoursState> {
  const next: Record<number, DayHoursState> = { ...current }
  for (const day of WEEKDAYS) {
    const enabled =
      mode === 'all' ||
      (mode === 'withSat' && day.dayOfWeek <= 6) ||
      (mode === 'weekdays' && day.dayOfWeek <= 5)
    next[day.dayOfWeek] = {
      enabled,
      openTime: current[day.dayOfWeek]?.openTime ?? '09:00',
      closeTime: current[day.dayOfWeek]?.closeTime ?? '18:00',
    }
  }
  return next
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={[
        'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200',
        checked ? 'bg-brand shadow-sm shadow-brand/30' : 'bg-black/10',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}

export function WorkingDaysPicker({ value, onChange, onApplyPreset, error }: Props) {
  function setPreset(mode: 'weekdays' | 'withSat' | 'all') {
    const next = applyPreset(mode, value)
    if (onApplyPreset) {
      onApplyPreset(next)
      return
    }
    for (const day of WEEKDAYS) {
      onChange(day.dayOfWeek, next[day.dayOfWeek])
    }
  }

  return (
    <fieldset className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <legend className="text-sm font-semibold text-ink">Работно време</legend>
          <p className="mt-0.5 text-xs text-ink-muted">
            Включи дни и настрои часовете — събота може да е по-кратка.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['weekdays', 'Пн–Пет'],
              ['withSat', 'Пн–Съб'],
              ['all', 'Всички'],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPreset(mode)}
              className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand transition hover:bg-brand/20"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className="overflow-hidden rounded-3xl border border-white/50 bg-white/35 shadow-sm backdrop-blur-xl divide-y divide-black/[0.04]">
        {WEEKDAYS.map((day) => {
          const row = value[day.dayOfWeek]
          const on = row.enabled
          return (
            <li
              key={day.dayOfWeek}
              className={[
                'flex flex-wrap items-center gap-3 px-3.5 py-3 transition-colors sm:flex-nowrap',
                on ? 'bg-transparent' : 'bg-black/[0.02]',
              ].join(' ')}
            >
              <div className="flex min-w-[7.5rem] flex-1 items-center gap-3">
                <span
                  className={[
                    'flex size-9 items-center justify-center rounded-full text-xs font-semibold',
                    on
                      ? 'bg-brand text-white shadow-sm shadow-brand/25'
                      : 'bg-black/5 text-ink-muted',
                  ].join(' ')}
                >
                  {day.label.slice(0, 2)}
                </span>
                <span className={['text-sm font-medium', on ? 'text-ink' : 'text-ink-muted'].join(' ')}>
                  {day.label}
                </span>
              </div>

              <div
                className={[
                  'flex flex-1 items-center justify-end gap-2 sm:min-w-[14rem]',
                  on ? 'opacity-100' : 'pointer-events-none opacity-35',
                ].join(' ')}
              >
                <label className="relative">
                  <span className="sr-only">{day.label} от</span>
                  <input
                    type="time"
                    step={1800}
                    disabled={!on}
                    value={row.openTime}
                    onChange={(e) => onChange(day.dayOfWeek, { openTime: e.target.value })}
                    className="h-9 w-[6.75rem] rounded-full border border-white/70 bg-white/80 px-3 text-center text-sm font-medium tabular-nums text-ink shadow-sm outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:opacity-45"
                  />
                </label>
                <span className="text-xs font-medium text-ink-muted" aria-hidden>
                  —
                </span>
                <label className="relative">
                  <span className="sr-only">{day.label} до</span>
                  <input
                    type="time"
                    step={1800}
                    disabled={!on}
                    value={row.closeTime}
                    onChange={(e) => onChange(day.dayOfWeek, { closeTime: e.target.value })}
                    className="h-9 w-[6.75rem] rounded-full border border-white/70 bg-white/80 px-3 text-center text-sm font-medium tabular-nums text-ink shadow-sm outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:opacity-45"
                  />
                </label>
              </div>

              <Switch
                checked={on}
                label={`${day.label} работи`}
                onChange={(enabled) => onChange(day.dayOfWeek, { enabled })}
              />
            </li>
          )
        })}
      </ul>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </fieldset>
  )
}
