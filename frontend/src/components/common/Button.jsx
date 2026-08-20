import React from 'react'

export default function Button({ children, className = '', variant = 'primary', ...props }) {
  const base = 'px-4 py-2 rounded-md shadow-sm disabled:opacity-50 text-sm'
  const variants = {
    primary: 'bg-purifly text-white',
    secondary: 'bg-white border text-gray-800',
    ghost: 'bg-transparent text-purifly'
  }
  const cls = `${base} ${variants[variant] || variants.primary} ${className}`
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  )
}
