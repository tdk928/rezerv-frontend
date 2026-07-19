import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { RequireRole } from './components/RequireRole'
import { AdminCompaniesPage } from './pages/AdminCompaniesPage'
import { BusinessOnboardingPage } from './pages/BusinessOnboardingPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MyCompaniesPage } from './pages/MyCompaniesPage'
import { MySalonsPage } from './pages/MySalonsPage'
import { RegisterPage } from './pages/RegisterPage'
import { BookAppointmentPage } from './pages/BookAppointmentPage'
import { SalonDetailPage } from './pages/SalonDetailPage'
import { SalonsPage } from './pages/SalonsPage'
import { StatusPage } from './pages/StatusPage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/salons" element={<SalonsPage />} />
        <Route path="/salons/:id" element={<SalonDetailPage />} />
        <Route path="/salons/:id/book" element={<BookAppointmentPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route
          path="/business/onboarding"
          element={
            <RequireAuth>
              <BusinessOnboardingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/business/companies"
          element={
            <RequireAuth>
              <MyCompaniesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/business/salons"
          element={
            <RequireAuth>
              <MySalonsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <RequireRole role="PLATFORM_ADMIN">
              <AdminCompaniesPage />
            </RequireRole>
          }
        />
      </Route>
    </Routes>
  )
}
