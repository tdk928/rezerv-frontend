import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/status" element={<StatusPage />} />
      </Route>
    </Routes>
  )
}
