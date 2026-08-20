import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getData, setData } from '../services/storage'
import { adjustProductStock } from '../services/inventory'
import { formatDate } from '../utils/formatters'

export default function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const orders = getData('purifly_orders') || []
  const order = orders.find((o) => o.id === id)

  if (!order) return <div>Order not found</div>

  function changeStatus(status) {
    const next = orders.map((o) => (o.id === order.id ? { ...o, status } : o))
    // handle cancellation: restore stock and reverse customer balance once
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      try {
        // restore stock if not already restored
        if (!order._stockRestored) {
          order.products.forEach((p) => {
            adjustProductStock({ productId: p.id, qtyChange: Number(p.qty), type: 'Order Cancellation', reason: 'Cancel ' + order.id, user: 'System' })
          })
          order._stockRestored = true
        }
        // reverse customer outstanding
        if (!order._balanceReversed) {
          const customers = getData('purifly_customers') || []
          const cust = customers.find((c) => c.id === order.customerId)
          if (cust) {
            cust.balance = Number(cust.balance || cust.openingBalance || 0) - Number(order.remainingAmount || 0)
            const updated = customers.map((c) => (c.id === cust.id ? cust : c))
            setData('purifly_customers', updated)
          }
          order._balanceReversed = true
        }
      } catch (e) {
        console.error('Cancellation restore failed', e)
      }
    }
    setData('purifly_orders', next.map((o) => (o.id === order.id ? order : o)))
    navigate('/orders')
  }

  return (
    <div>
      <div className="bg-white p-3 rounded shadow mb-3">
        <div className="font-semibold">{order.customerName}</div>
        <div className="text-xs text-gray-500">{order.id} • {formatDate(order.date)}</div>
      </div>

      <div className="bg-white p-3 rounded shadow mb-3">
        {order.products.map((p) => (
          <div key={p.id} className="flex justify-between mb-2">
            <div>{p.name} × {p.qty}</div>
            <div>Rs. {p.price * p.qty}</div>
          </div>
        ))}
        <div className="mt-2 flex justify-between font-semibold"><div>Subtotal</div><div>Rs. {order.subtotal}</div></div>
        <div className="flex justify-between"><div>Discount</div><div>Rs. {order.discount}</div></div>
        <div className="flex justify-between font-semibold"><div>Total</div><div>Rs. {order.total}</div></div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => changeStatus('Completed')} className="px-4 py-2 bg-green-600 text-white rounded">Complete</button>
        <button onClick={() => changeStatus('Cancelled')} className="px-4 py-2 bg-red-600 text-white rounded">Cancel</button>
      </div>
    </div>
  )
}
