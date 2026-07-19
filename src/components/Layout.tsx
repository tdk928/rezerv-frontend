import { Outlet } from 'react-router'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col sm:flex-row sm:items-start sm:gap-2 sm:px-1 sm:pb-4">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
