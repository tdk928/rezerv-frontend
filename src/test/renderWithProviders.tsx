import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../auth/AuthContext'
import { StatusPage } from '../pages/StatusPage'

/** Рендерира страница с всички app providers + /status route за проверка на redirect. */
export function renderWithProviders(page: ReactNode, { path = '/' } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path={path} element={page} />
            <Route path="/status" element={<StatusPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )
}
