import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Users, ShoppingCart, Box, MoreHorizontal, Boxes, Receipt } from 'lucide-react'

const items = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/products', label: 'Products', icon: Box },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/profile', label: 'More', icon: MoreHorizontal }
]

export default function BottomNavigation() {
  return (
    <nav className="bg-white shadow-inner fixed bottom-0 left-0 right-0 md:hidden">
      <div className="max-w-4xl mx-auto flex justify-between">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `flex-1 p-3 text-center text-xs ${isActive ? 'text-purifly' : 'text-gray-600'}`
            }
          >
            <div className="flex flex-col items-center">
              <it.icon size={18} />
              <span className="mt-1">{it.label}</span>
            </div>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
