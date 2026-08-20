import React, { useEffect, useState } from 'react'
import { getData, setData } from '../services/storage'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import { subtotal, totalItems } from '../utils/calculations'
import { adjustProductStock } from '../services/inventory'
import { addPayment } from '../services/payments'

export default function NewOrder() {
  const products = (getData('purifly_products') || []).filter((p) => p.isActive !== false)
  const customers = getData('purifly_customers') || []
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [cart, setCart] = useState([])
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState('fixed')
  const [paymentType, setPaymentType] = useState('Paid')
  const [paidAmount, setPaidAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('Cash')

  useEffect(() => {
    // restore unfinished cart if needed
  }, [])

  function addToCart(p) {
    const existing = cart.find((c) => c.id === p.id)
    const available = Number(p.stock || 0)
    if (available <= 0) return alert('Out of stock')
    if (existing) {
      if (existing.qty + 1 > available) return alert('Insufficient stock')
      setCart(cart.map((c) => (c.id === p.id ? { ...c, qty: c.qty + 1 } : c)))
    } else {
      setCart([...cart, { ...p, qty: 1 }])
    }
  }

  function changeQty(id, delta) {
    setCart((c) =>
      c
        .map((it) => {
          if (it.id === id) {
            const prod = products.find((p) => p.id === id)
            const max = Number(prod?.stock || 0)
            const next = Math.max(0, it.qty + delta)
            if (next > max) {
              alert('Insufficient stock')
              return it
            }
            return { ...it, qty: next }
          }
          return it
        })
        .filter((it) => it.qty > 0)
    )
  }

  function saveOrder() {
    if (!selectedCustomer) return alert('Select customer')
    if (cart.length === 0) return alert('Add at least one product')
    // validate stock again
    for (const c of cart) {
      const prod = products.find((p) => p.id === c.id)
      if (!prod) return alert('Product not found')
      if (c.qty > Number(prod.stock || 0)) return alert('Insufficient stock for ' + prod.name)
    }
    const orders = getData('purifly_orders') || []
    const id = 'ORD-' + (1026 + orders.length)
    const sub = subtotal(cart)
    let discountValue = 0
    if (discountType === 'percent') {
      discountValue = Math.min(sub, (sub * Number(discount || 0)) / 100)
    } else {
      discountValue = Math.min(sub, Number(discount || 0))
    }
    const total = sub - discountValue

    // determine paid/remaining based on paymentType
    let paid = 0
    if (paymentType === 'Paid') paid = total
    else if (paymentType === 'Partial') paid = Math.min(Number(paidAmount || 0), total)
    else paid = 0
    const remaining = Math.max(0, total - paid)
    const order = {
      id,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.shopName,
      products: cart.map((c) => ({ id: c.id, name: c.name, price: c.price, qty: c.qty })),
      subtotal: sub,
      discount: discountValue,
      discountRaw: discount,
      discountType,
      total,
      paidAmount: paid,
      remainingAmount: remaining,
      paymentStatus: remaining === 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Credit',
      date: new Date().toISOString(),
      status: 'Pending'
    }
    const next = [order, ...orders]
    setData('purifly_orders', next)
    // record payment if any
    if (paid > 0) {
      try {
        addPayment({ orderId: id, customerId: selectedCustomer.id, amount: paid, method: paymentMethod, note: 'Order payment ' + id })
      } catch (e) {
        console.error('Payment save failed', e)
      }
    }
    // update customer outstanding balance (increase by remaining)
    const allCustomers = getData('purifly_customers') || []
    const cust = allCustomers.find((c) => c.id === selectedCustomer.id)
    if (cust) {
      const prevBal = Number(cust.balance || cust.openingBalance || 0)
      cust.balance = prevBal + remaining
      const updated = allCustomers.map((c) => (c.id === cust.id ? cust : c))
      setData('purifly_customers', updated)
    }
    // deduct stock and create inventory movements
    const user = getData('purifly_user') || { name: 'Sales' }
    try {
      cart.forEach((c) => {
        adjustProductStock({ productId: c.id, qtyChange: -c.qty, type: 'Stock Out', reason: 'Order ' + id, user: user.name })
      })
    } catch (e) {
      alert(e.message)
      return
    }
    alert('Order saved')
    // redirect to orders
    window.location.href = '/orders'
  }

  const sub = subtotal(cart)
  const items = totalItems(cart)
  const computedDiscount = discountType === 'percent' ? Math.min(sub, (sub * Number(discount || 0)) / 100) : Math.min(sub, Number(discount || 0))
  const grandTotal = sub - computedDiscount

  return (
    <div>
      <div className="bg-white p-3 rounded shadow mb-3">
        <div className="text-sm font-semibold mb-2">Select Customer</div>
        <select className="w-full p-2 border rounded" onChange={(e) => setSelectedCustomer(customers.find((c) => c.id === e.target.value))}>
          <option value="">-- Select --</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.shopName} - {c.mobile}</option>)}
        </select>
      </div>

      <div className="mb-3">
        <div className="text-sm font-semibold mb-2">Products</div>
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="bg-white p-3 rounded shadow flex justify-between items-center">
              <div>
                <div className="font-semibold">{p.name} {Number(p.stock || 0) === 0 && <span className="text-xs text-red-500">• Out of Stock</span>}</div>
                <div className="text-xs text-gray-500">Rs. {p.price}</div>
              </div>
              <div>
                <Button onClick={() => addToCart(p)} disabled={Number(p.stock || 0) === 0}>
                  {Number(p.stock || 0) === 0 ? 'Out of Stock' : 'Add'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-3 rounded shadow mb-3">
        <div className="text-sm font-semibold mb-2">Cart</div>
        {cart.length === 0 && <div className="text-sm text-gray-500">No products added</div>}
        <div className="space-y-2">
          {cart.map((c) => (
            <div key={c.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">Rs. {c.price} × {c.qty} = Rs. {c.price * c.qty}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => changeQty(c.id, -1)} className="px-2 py-1 bg-gray-200 rounded">-</button>
                <div>{c.qty}</div>
                <button onClick={() => changeQty(c.id, +1)} className="px-2 py-1 bg-gray-200 rounded">+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <div className="flex justify-between"><div>Total Items</div><div>{items}</div></div>
          <div className="flex justify-between"><div>Subtotal</div><div>Rs. {sub}</div></div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <Input label="Discount" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm">Type</label>
              <select className="w-full p-2 border rounded" value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                <option value="fixed">Fixed</option>
                <option value="percent">Percent</option>
              </select>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm">Payment</label>
              <select className="w-full p-2 border rounded" value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
            <div>
              <Input label="Paid Amount" value={paidAmount} type="number" onChange={(e) => setPaidAmount(e.target.value)} />
            </div>
          </div>
          <div className="mt-2">
            <label className="block text-sm">Payment Method</label>
            <select className="w-full p-2 border rounded" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option>Cash</option>
              <option>Bank</option>
              <option>Easypaisa</option>
              <option>JazzCash</option>
              <option>Other</option>
            </select>
          </div>
          <div className="flex justify-between font-semibold mt-2"><div>Grand Total</div><div>Rs. {grandTotal}</div></div>
          <div className="mt-3">
            <Button onClick={saveOrder}>Save Order</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
