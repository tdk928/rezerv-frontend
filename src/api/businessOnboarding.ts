import { getAuth, postAuth } from './http'
import type { City } from './business'

/** Protected B2B onboarding — `/api/business/**` с JWT през gateway. */

export interface CompanyResponse {
  id: number
  eik: string
  name: string
  legalName: string
  ownerUserId: number
  status: string
  createdAt: string
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
}

export interface SalonServiceResponse {
  id: number
  salonId: number
  categoryId: number
  name: string
  durationMin: number
  price: number
  active: boolean
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

export function listMyCompanies(accessToken: string): Promise<CompanyResponse[]> {
  return getAuth<CompanyResponse[]>('/business/companies/mine', accessToken)
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

export function createSalonPhoto(
  accessToken: string,
  salonId: number,
  request: CreateSalonPhotoRequest,
): Promise<SalonPhotoResponse> {
  return postAuth<SalonPhotoResponse>(`/business/salons/${salonId}/photos`, request, accessToken)
}
