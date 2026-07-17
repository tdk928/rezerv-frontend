import { Outlet } from 'react-router'
import { Navbar } from './Navbar'

export function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <Outlet />
    </div>
  )
}
