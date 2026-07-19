import { deleteAuth, getAuth, postAuth, putAuth } from './http'
import type { City } from './business'

/** Protected B2B onboarding — `/api/business/**` с JWT през gateway. */

export interface CompanyResponse {
  id: number
  eik: string
  name: string
  legalName: string
  email: string
  phone: string
  ownerUserId: number
  status: string
  createdAt: string
}

export interface CompanyWithSalonsResponse extends CompanyResponse {
  salons: SalonResponse[]
}

export interface OwnerSummary {
  id: number
  email: string | null
  firstName: string | null
  lastName: string | null
}

export interface AdminCompanyResponse {
  id: number
  eik: string
  name: string
  legalName: string
  email: string
  phone: string
  status: string
  createdAt: string
  updatedAt: string
  owner: OwnerSummary
}

export interface SalonServiceResponse {
  id: number
  salonId: number
  categoryId: number
  categoryName?: string
  name: string
  durationMin: number
  price: number
  active: boolean
}

export interface WorkingHoursResponse {
  dayOfWeek: number
  openTime: string
  closeTime: string
}

export interface SalonResponse {
  id: number
  companyId: number
  name: string
  description: string | null
  city: City
  address: string
  lat: number | null
  lng: number | null
  email: string
  phone: string
  status: string
  services?: SalonServiceResponse[]
  workingHours?: WorkingHoursResponse[]
}

export interface SalonPhotoResponse {
  id: number
  salonId: number
  url: string
  position: number
}

export interface CreateCompanyRequest {
  eik: string
  name: string
  legalName: string
  email: string
  phone: string
}

export interface CreateSalonRequest {
  name: string
  description?: string
  cityId: number
  address: string
  lat?: number
  lng?: number
  email: string
  phone: string
  workingHours: Array<{
    dayOfWeek: number
    openTime: string
    closeTime: string
  }>
}

export interface CreateSalonServiceRequest {
  categoryId: number
  name: string
  durationMin: number
  price: number
}

export interface CreateSalonPhotoRequest {
  url: string
  position?: number
}

export function createCompany(
  accessToken: string,
  request: CreateCompanyRequest,
): Promise<CompanyResponse> {
  return postAuth<CompanyResponse>('/business/companies', request, accessToken)
}

export function listMyCompanies(accessToken: string): Promise<CompanyWithSalonsResponse[]> {
  return getAuth<CompanyWithSalonsResponse[]>('/business/companies/mine', accessToken)
}

export function listAdminCompanies(accessToken: string): Promise<AdminCompanyResponse[]> {
  return getAuth<AdminCompanyResponse[]>('/business/admin/companies', accessToken)
}

export function approveCompany(
  accessToken: string,
  companyId: number,
): Promise<AdminCompanyResponse> {
  return postAuth<AdminCompanyResponse>(`/business/admin/companies/${companyId}/approve`, {}, accessToken)
}

export function createSalon(
  accessToken: string,
  companyId: number,
  request: CreateSalonRequest,
): Promise<SalonResponse> {
  return postAuth<SalonResponse>(`/business/companies/${companyId}/salons`, request, accessToken)
}

export function createSalonService(
  accessToken: string,
  salonId: number,
  request: CreateSalonServiceRequest,
): Promise<SalonServiceResponse> {
  return postAuth<SalonServiceResponse>(`/business/salons/${salonId}/services`, request, accessToken)
}

export function removeSalonService(
  accessToken: string,
  salonId: number,
  serviceId: number,
): Promise<void> {
  return deleteAuth(`/business/salons/${salonId}/services/${serviceId}`, accessToken)
}

export function createSalonPhoto(
  accessToken: string,
  salonId: number,
  request: CreateSalonPhotoRequest,
): Promise<SalonPhotoResponse> {
  return postAuth<SalonPhotoResponse>(`/business/salons/${salonId}/photos`, request, accessToken)
}

export interface StaffMemberResponse {
  id: number
  salonId: number
  userId: number
  displayName: string
  title: string | null
  active: boolean
  serviceIds: number[]
  workingHours: WorkingHoursResponse[]
}

export interface AddStaffRequest {
  email: string
  displayName?: string
  title?: string
}

export function listSalonStaff(accessToken: string, salonId: number): Promise<StaffMemberResponse[]> {
  return getAuth<StaffMemberResponse[]>(`/business/salons/${salonId}/staff`, accessToken)
}

export function addSalonStaff(
  accessToken: string,
  salonId: number,
  request: AddStaffRequest,
): Promise<StaffMemberResponse> {
  return postAuth<StaffMemberResponse>(`/business/salons/${salonId}/staff`, request, accessToken)
}

export function replaceStaffServices(
  accessToken: string,
  staffId: number,
  serviceIds: number[],
): Promise<StaffMemberResponse> {
  return putAuth<StaffMemberResponse>(`/business/staff/${staffId}/services`, { serviceIds }, accessToken)
}
