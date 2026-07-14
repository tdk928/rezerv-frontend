import type { AuthResponse } from '../api/auth'
import type { City, PageResponse, SalonCard, ServiceCategory } from '../api/business'

export function makeAuthResponse(overrides: Partial<AuthResponse> = {}): AuthResponse {
  return {
    accessToken: 'jwt-token',
    refreshToken: 'refresh-uuid',
    expiresInSeconds: 900,
    user: {
      id: 1,
      email: 'ivan@example.bg',
      phone: null,
      firstName: 'Иван',
      lastName: 'Иванов',
      companyId: null,
      status: 'ACTIVE',
      roles: ['CLIENT'],
      createdAt: '2026-07-14T10:00:00Z',
    },
    ...overrides,
  }
}

export function makeCities(): City[] {
  return [
    { id: 1, name: 'София', slug: 'sofia' },
    { id: 2, name: 'Пловдив', slug: 'plovdiv' },
  ]
}

export function makeCategories(): ServiceCategory[] {
  return [
    { id: 1, name: 'Масаж', slug: 'masazh', icon: 'massage' },
    { id: 2, name: 'Фризьор', slug: 'frizyor', icon: 'scissors' },
  ]
}

export function makeSalonCard(overrides: Partial<SalonCard> = {}): SalonCard {
  return {
    id: 10,
    name: 'Barber Bros',
    city: { id: 1, name: 'София', slug: 'sofia' },
    address: 'ул. Шишман 12',
    ratingAvg: 4.9,
    ratingCount: 211,
    photoUrl: 'https://example.com/photo.jpg',
    priceFrom: 25,
    ...overrides,
  }
}

export function makeSalonPage(content: SalonCard[] = [makeSalonCard()]): PageResponse<SalonCard> {
  return { content, page: 0, size: 20, totalElements: content.length, totalPages: 1 }
}
