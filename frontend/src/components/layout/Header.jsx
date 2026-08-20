import React, { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import { Menu, Bell, User2 } from 'lucide-react'

export default function Header() {
  const { user } = useContext(AuthContext)

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-md text-purifly/90 bg-purifly/10 md:hidden"><Menu size={18} /></button>
          <div>
            <div className="text-lg font-semibold text-purifly">Aab-e-Noor Water Sales</div>
            <div className="text-xs text-gray-500">Order • Save • Deliver</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-md text-gray-600"><Bell size={18} /></button>
          <div className="flex items-center gap-2">
            <div className="hidden md:block text-right">
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.role}</div>
            </div>
            <div className="p-2 bg-purifly text-white rounded-full"><User2 size={16} /></div>
          </div>
        </div>
      </div>
    </header>
  )
}
