import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { formatDate } from '../utils/formatters'
import { apiRequest } from '../api/api'

export default function CustomerDetails() {
  const { id } = useParams()

  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [payments, setPayments] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showReceive, setShowReceive] = useState(false)
  const [savingPayment, setSavingPayment] = useState(false)

  const [form, setForm] = useState({
    amount: '',
    method: 'Cash',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  })

  async function loadCustomerData() {
    try {
      setLoading(true)
      setError('')

      const [customerData, ordersData, paymentsData] = await Promise.all([
        apiRequest(`/customers/${id}`),
        apiRequest('/orders'),
        apiRequest('/payments'),
      ])

      setCustomer(customerData)

      const customerOrders = Array.isArray(ordersData)
        ? ordersData.filter(
            (order) => Number(order.customer_id) === Number(id)
          )
        : []

      const customerPayments = Array.isArray(paymentsData)
        ? paymentsData.filter(
            (payment) => Number(payment.customer_id) === Number(id)
          )
        : []

      setOrders(customerOrders)
      setPayments(customerPayments)
    } catch (err) {
      console.error('Failed to load customer details:', err)
      setError(err.message || 'Failed to load customer details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomerData()
  }, [id])

  function openReceive() {
    setForm({
      amount: '',
      method: 'Cash',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    })

    setShowReceive(true)
  }

  async function submitReceive() {
    const amount = Number(form.amount || 0)
    const outstanding = Number(customer?.outstanding_balance || 0)

    if (!(amount > 0)) {
      alert('Payment amount must be greater than 0')
      return
    }

    if (amount > outstanding) {
      alert('Payment cannot exceed outstanding balance')
      return
    }

    try {
      setSavingPayment(true)
      setError('')

      await apiRequest('/payments', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: Number(customer.id),
          amount,
          payment_method: form.method,
          payment_date: form.date,
          notes: form.notes || null,
        }),
      })

      setShowReceive(false)

      await loadCustomerData()

      alert('Payment recorded successfully')
    } catch (err) {
      console.error('Failed to record payment:', err)
      setError(err.message || 'Failed to record payment')
    } finally {
      setSavingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Loading customer details...
      </div>
    )
  }

  if (error && !customer) {
    return (
      <div className="bg-red-50 text-red-600 p-3 rounded">
        {error}
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-sm text-gray-500">
        Customer not found
      </div>
    )
  }

  const customerName = customer.name || 'Unnamed Customer'
  const shopName = customer.shop_name || customerName
  const phone = customer.phone || '-'
  const alternatePhone = customer.alternate_phone || '-'
  const address = customer.address || '-'

  const outstanding = Number(
    customer.outstanding_balance || 0
  )

  const totalOrders = orders.length

  const totalPurchases = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  )

  const sortedOrders = [...orders].sort(
    (a, b) =>
      new Date(b.order_date) -
      new Date(a.order_date)
  )

  const sortedPayments = [...payments].sort(
    (a, b) =>
      new Date(a.payment_date) -
      new Date(b.payment_date)
  )

  const totalPaid = sortedPayments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount || 0),
    0
  )

  const initialOutstanding = outstanding + totalPaid

  let cumulativePaid = 0

  return (
    <div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {/* Customer Information */}
      <div className="bg-white p-3 rounded shadow mb-3">

        <div className="text-lg font-semibold">
          {shopName}
        </div>

        <div className="text-xs text-gray-500">
          Customer: {customerName}
        </div>

        <div className="text-xs text-gray-500">
          Mobile: {phone} • Alternate: {alternatePhone}
        </div>

        <div className="text-xs text-gray-500">
          {address}
        </div>

        {customer.area && (
          <div className="text-xs text-gray-500">
            Area: {customer.area}
          </div>
        )}

      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">

        <div className="bg-white p-3 rounded shadow">
          Current Balance

          <div className="text-xl font-semibold">
            Rs. {outstanding.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-3 rounded shadow">
          Total Orders

          <div className="text-xl font-semibold">
            {totalOrders}
          </div>
        </div>

        <div className="bg-white p-3 rounded shadow">
          Total Purchases

          <div className="text-xl font-semibold">
            Rs. {totalPurchases.toLocaleString()}
          </div>
        </div>

      </div>

      {/* Order History */}
      <div className="bg-white p-3 rounded shadow mb-3">

        <div className="flex justify-between items-center mb-2">

          <div className="font-semibold">
            Order History
          </div>

          {outstanding > 0 && (
            <button
              onClick={openReceive}
              className="text-sm text-purifly"
            >
              Receive Payment
            </button>
          )}

        </div>

        {sortedOrders.length === 0 && (
          <div className="text-sm text-gray-500">
            No orders
          </div>
        )}

        {sortedOrders.map((order) => (

          <div
            key={order.id}
            className="flex justify-between py-2 border-b"
          >

            <div>

              <div className="font-semibold">
                {order.order_number || `Order #${order.id}`}
              </div>

              <div className="text-xs text-gray-500">
                {formatDate(order.order_date)}
              </div>

            </div>

            <div className="text-right">

              <div>
                Rs. {Number(order.total || 0).toLocaleString()}
              </div>

              <div className="text-xs">
                {order.order_status || '-'}
              </div>

            </div>

          </div>

        ))}

      </div>

      {/* Payment History */}
      <div className="bg-white p-3 rounded shadow">

        <div className="font-semibold mb-2">
          Payment History
        </div>

        {sortedPayments.length === 0 && (
          <div className="text-sm text-gray-500">
            No payments
          </div>
        )}

        {sortedPayments.map((payment) => {

          cumulativePaid += Number(
            payment.amount || 0
          )

          const remaining =
            initialOutstanding - cumulativePaid

          return (
            <div
              key={payment.id}
              className="flex justify-between py-2 border-b"
            >

              <div>

                <div className="font-semibold">
                  {payment.payment_method || 'Cash'}
                </div>

                <div className="text-xs text-gray-500">
                  {formatDate(payment.payment_date)}
                </div>

                {payment.payment_number && (
                  <div className="text-xs text-gray-500">
                    {payment.payment_number}
                  </div>
                )}

              </div>

              <div className="text-right">

                <div>
                  Rs. {Number(payment.amount || 0).toLocaleString()}
                </div>

                <div className="text-xs text-gray-500">
                  Remaining: Rs. {Math.max(0, remaining).toLocaleString()}
                </div>

              </div>

            </div>
          )
        })}

      </div>

      {/* Receive Payment Modal */}
      {showReceive && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

          <div className="bg-white w-full max-w-md p-4 rounded-lg">

            <div className="font-semibold mb-2">
              Receive Payment
            </div>

            <div className="text-sm text-gray-500 mb-3">
              Customer: {shopName}
            </div>

            <div className="text-sm text-gray-500 mb-3">
              Outstanding: Rs. {outstanding.toLocaleString()}
            </div>

            <div className="space-y-2">

              <div>
                <label className="block text-sm">
                  Payment Amount
                </label>

                <input
                  type="number"
                  min="0"
                  className="w-full p-2 border rounded"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      amount: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm">
                  Payment Method
                </label>

                <select
                  className="w-full p-2 border rounded"
                  value={form.method}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      method: e.target.value,
                    })
                  }
                >
                  <option>Cash</option>
                  <option>Bank</option>
                  <option>Easypaisa</option>
                  <option>JazzCash</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm">
                  Payment Date
                </label>

                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm">
                  Notes
                </label>

                <input
                  className="w-full p-2 border rounded"
                  value={form.notes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      notes: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-2 mt-3">

                <button
                  className="px-3 py-2 rounded bg-gray-200"
                  onClick={() => setShowReceive(false)}
                  disabled={savingPayment}
                >
                  Cancel
                </button>

                <button
                  className="px-3 py-2 rounded bg-purifly text-white"
                  onClick={submitReceive}
                  disabled={savingPayment}
                >
                  {savingPayment
                    ? 'Saving...'
                    : 'Save Payment'}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}