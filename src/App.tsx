import { Navigate, Route, Routes } from 'react-router'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { StatusPage } from './pages/StatusPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/status" element={<StatusPage />} />
    </Routes>
  )
}
