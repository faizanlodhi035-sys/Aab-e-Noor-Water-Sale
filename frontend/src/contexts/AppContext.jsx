import React, { createContext, useEffect, useState } from 'react'
import { getData, setData } from '../services/storage'

export const AppContext = createContext()

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(() => getData('purifly_settings') || { darkMode: false })

  useEffect(() => {
    setData('purifly_settings', settings)
  }, [settings])

  return <AppContext.Provider value={{ settings, setSettings }}>{children}</AppContext.Provider>
}
