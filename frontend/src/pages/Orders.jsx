import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getData, setData } from '../services/storage'
import { formatDate } from '../utils/formatters'
import Button from '../components/common/Button'

export default function Orders() {
  const [orders, setOrders] = useState(getData('purifly_orders') || [])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    setData('purifly_orders', orders)
  }, [orders])

  function changeStatus(id, status) {
    const next = orders.map((o) => (o.id === id ? { ...o, status } : o))
    setOrders(next)
  }

  const list = orders.filter((o) => {
    if (filter !== 'All' && o.status !== filter) return false
    if (!q) return true
    return o.id.includes(q) || o.customerName.toLowerCase().includes(q.toLowerCase())
  })

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <input placeholder="Search orders" className="flex-1 px-3 py-2 border rounded" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border rounded">
          <option>All</option>
          <option>Pending</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
        <Link to="/orders/new"><Button>New</Button></Link>
      </div>

      <div className="space-y-2">
        {list.map((o) => (
          <div key={o.id} className="bg-white p-3 rounded shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">{o.customerName}</div>
              <div className="text-xs text-gray-500">{o.id} • {formatDate(o.date)}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">Rs. {o.total}</div>
              <div className="text-xs">{o.status}</div>
              <div className="mt-2 flex gap-2">
                <Link to={`/orders/${o.id}`} className="text-xs text-purifly">View</Link>
                {o.status !== 'Completed' && <button onClick={() => changeStatus(o.id, 'Completed')} className="text-xs text-green-600">Complete</button>}
                {o.status !== 'Cancelled' && <button onClick={() => changeStatus(o.id, 'Cancelled')} className="text-xs text-red-600">Cancel</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
