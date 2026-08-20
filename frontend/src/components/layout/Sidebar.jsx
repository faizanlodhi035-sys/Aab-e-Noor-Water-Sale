import React, { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Users,
  ShoppingCart,
  Box,
  FileText,
  Settings,
  Boxes,
  Receipt,
  LogOut
} from 'lucide-react'

import { AuthContext } from '../../contexts/AuthContext'

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/products', label: 'Products', icon: Box },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings }
]

export default function Sidebar() {
  const { logout } = useContext(AuthContext)
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="hidden md:flex md:flex-col w-56 bg-white shadow rounded-lg p-3 sticky top-4 h-[calc(100vh-2rem)]">

      {/* Logo */}
      <div className="mb-4 text-center">
        <div className="text-purifly font-bold text-lg">
          Aab-e-Noor
        </div>

        <div className="text-xs text-gray-500">
          Water Sales
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 overflow-y-auto">

        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                isActive
                  ? 'bg-purifly/10 text-purifly font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <it.icon size={18} />
            <span>{it.label}</span>
          </NavLink>
        ))}

      </nav>

      {/* Logout */}
      <div className="pt-3 mt-3 border-t border-gray-100">

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

      </div>

    </aside>
  )
}


