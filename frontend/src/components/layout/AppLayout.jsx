import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNavigation from './BottomNavigation'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-5xl mx-auto p-4 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
        <Sidebar />
        <main className="flex-1">
          <div className="bg-transparent">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNavigation />
    </div>
  )
}
