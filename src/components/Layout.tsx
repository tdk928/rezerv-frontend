import { Outlet } from 'react-router'
import { Navbar } from './Navbar'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />
      <Outlet />
    </div>
  )
}
