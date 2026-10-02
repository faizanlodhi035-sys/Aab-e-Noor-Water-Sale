import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNavigation from './BottomNavigation'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        mobileMenuOpen={mobileMenuOpen}
        onMenuToggle={() => setMobileMenuOpen((open) => !open)}
      />

      <div className="max-w-5xl mx-auto p-4 pb-20 md:pb-4 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
        <Sidebar />

        <main className="flex-1">
          <div className="bg-transparent">
            <Outlet />
          </div>
        </main>
      </div>

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close mobile navigation"
          onClick={closeMobileMenu}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      <Sidebar
        mobile
        mobileOpen={mobileMenuOpen}
        onNavigate={closeMobileMenu}
      />

      <BottomNavigation />
    </div>
  )
}
