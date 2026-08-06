import { get, postAuth } from './http'

export interface AvailableStaffResponse {
  id: number
  displayName: string
}

export interface SlotResponse {
  startsAt: string
  endsAt: string
  staffIds: number[]
  staff: AvailableStaffResponse[]
}

export interface DaySlotsResponse {
  date: string
  slots: SlotResponse[]
}

export interface AppointmentResponse {
  id: number
  salonId: number
  staffId: number
  serviceId: number
  clientUserId: number
  startsAt: string
  endsAt: string
  status: string
  priceSnapshot: number
  clientNote: string | null
  createdAt: string
}

export function getPublicSlots(
  salonId: number,
  serviceId: number,
  from: string,
  to: string,
  staffId?: number,
): Promise<DaySlotsResponse[]> {
  const params = new URLSearchParams({
    serviceId: String(serviceId),
    from,
    to,
  })
  if (staffId != null) params.set('staffId', String(staffId))
  return get<DaySlotsResponse[]>(`/bookings/public/salons/${salonId}/slots?${params}`)
}

export function createAppointment(
  accessToken: string,
  body: {
    salonId: number
    serviceId: number
    staffId: number
    startsAt: string
    clientNote?: string
  },
): Promise<AppointmentResponse> {
  return postAuth<AppointmentResponse>('/bookings/appointments', body, accessToken)
}
