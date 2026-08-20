import React from 'react'

export default function Help() {
  return (
    <div>
      <div className="bg-white p-3 rounded shadow mb-3">
        <div className="font-semibold">Help & Support</div>
        <div className="text-sm text-gray-500">For support contact:</div>
        <ul className="text-sm mt-2 space-y-1">
          <li>Phone: 0300-0000000</li>
          <li>Email: support@aab-e-noor.example</li>
        </ul>
      </div>
      <div className="bg-white p-3 rounded shadow">
        <div className="font-semibold">FAQ</div>
        <div className="text-sm text-gray-500 mt-2">How to create order? Use the New Order screen.</div>
      </div>
    </div>
  )
}
