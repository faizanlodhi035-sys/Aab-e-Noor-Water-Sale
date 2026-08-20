import React from 'react'

export default function Input({ label, ...props }) {
  return (
    <label className="block text-sm">
      {label && <div className="text-xs text-gray-600 mb-1">{label}</div>}
      <input className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm" {...props} />
    </label>
  )
}
