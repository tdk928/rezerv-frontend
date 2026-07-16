import { get } from './http'

/** Договор с rezerv-business през gateway-а (/api/business/public/**). */

export interface City {
  id: number
  name: string
  slug: string
}

export interface ServiceCategory {
  id: number
  name: string
  slug: string
  icon: string
}

export interface SalonCard {
  id: number
  name: string
  city: City
  address: string
  ratingAvg: number
  ratingCount: number
  photoUrl: string | null
  priceFrom: number | null
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface SalonSearchParams {
  cityId?: number
  categoryId?: number
  q?: string
  page?: number
  size?: number
}

export interface SalonServiceEntry {
  id: number
  name: string
  durationMin: number
  price: number
}

export interface SalonServiceGroup {
  categoryId: number
  categoryName: string
  categorySlug: string
  services: SalonServiceEntry[]
}

export interface SalonDetail {
  id: number
  name: string
  description: string | null
  city: City
  address: string
  lat: number | null
  lng: number | null
  email: string
  phone: string
  ratingAvg: number
  ratingCount: number
  photos: string[]
  serviceGroups: SalonServiceGroup[]
}

export function getCities(): Promise<City[]> {
  return get<City[]>('/business/public/cities')
}

export function getCategories(): Promise<ServiceCategory[]> {
  return get<ServiceCategory[]>('/business/public/categories')
}

export function searchSalons(params: SalonSearchParams): Promise<PageResponse<SalonCard>> {
  const query = new URLSearchParams()
  if (params.cityId !== undefined) query.set('cityId', String(params.cityId))
  if (params.categoryId !== undefined) query.set('categoryId', String(params.categoryId))
  if (params.q) query.set('q', params.q)
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.size !== undefined) query.set('size', String(params.size))
  return get<PageResponse<SalonCard>>(`/business/public/salons?${query.toString()}`)
}

export function getSalon(id: number): Promise<SalonDetail> {
  return get<SalonDetail>(`/business/public/salons/${id}`)
}
