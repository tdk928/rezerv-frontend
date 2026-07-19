/** ISO dayOfWeek: 1=пн … 7=нд */
export const WEEKDAYS = [
  { dayOfWeek: 1, label: 'Понеделник' },
  { dayOfWeek: 2, label: 'Вторник' },
  { dayOfWeek: 3, label: 'Сряда' },
  { dayOfWeek: 4, label: 'Четвъртък' },
  { dayOfWeek: 5, label: 'Петък' },
  { dayOfWeek: 6, label: 'Събота' },
  { dayOfWeek: 7, label: 'Неделя' },
] as const

export const DEFAULT_OPEN = '09:00'
export const DEFAULT_CLOSE = '18:00'

export type DayHoursState = {
  enabled: boolean
  openTime: string
  closeTime: string
}

export function defaultWorkingDaysState(): Record<number, DayHoursState> {
  const state: Record<number, DayHoursState> = {}
  for (const day of WEEKDAYS) {
    state[day.dayOfWeek] = {
      enabled: day.dayOfWeek >= 1 && day.dayOfWeek <= 5,
      openTime: DEFAULT_OPEN,
      closeTime: DEFAULT_CLOSE,
    }
  }
  return state
}

export function toWorkingHoursPayload(
  state: Record<number, DayHoursState>,
): Array<{ dayOfWeek: number; openTime: string; closeTime: string }> {
  return WEEKDAYS.filter((d) => state[d.dayOfWeek]?.enabled)
    .map((d) => ({
      dayOfWeek: d.dayOfWeek,
      openTime: state[d.dayOfWeek].openTime,
      closeTime: state[d.dayOfWeek].closeTime,
    }))
}
