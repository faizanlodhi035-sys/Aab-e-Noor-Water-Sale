import React from 'react'
import { getData } from '../services/storage'
import { getExpenses } from '../services/expenses'
import { getMovements } from '../services/inventory'
import { parseAmount, currency } from '../utils/formatters'

export default function Reports() {
  const orders = getData('purifly_orders') || []
  const products = getData('purifly_products') || []
  const customers = getData('purifly_customers') || []

  const totalOrders = orders.length
  const totalSales = orders.reduce((s, o) => s + (o.total || 0), 0)
  const totalBottles = orders.reduce((s, o) => s + (o.products?.reduce((ss, p) => ss + p.qty, 0) || 0), 0)
  const productCounts = {}
  orders.forEach((o) => o.products?.forEach((p) => { productCounts[p.name] = (productCounts[p.name] || 0) + p.qty }))

  const topProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const expenses = getExpenses() || []
  const movements = getMovements() || []

  const totalExpenses = expenses.reduce((s, e) => s + parseAmount(e.amount), 0)
  const totalInventoryValue = products.reduce((s, p) => s + (Number(p.stock || 0) * Number(p.price || 0)), 0)
  const totalExpensesDisplay = currency(totalExpenses)
  const totalInventoryValueDisplay = currency(totalInventoryValue)
  const lowStockItems = products.filter((p) => Number(p.stock || 0) <= Number(p.minStock || 0))

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white p-3 rounded shadow">Total Orders<div className="text-xl font-semibold">{totalOrders}</div></div>
        <div className="bg-white p-3 rounded shadow">Total Sales<div className="text-xl font-semibold">Rs. {totalSales}</div></div>
        <div className="bg-white p-3 rounded shadow">Total Bottles<div className="text-xl font-semibold">{totalBottles}</div></div>
        <div className="bg-white p-3 rounded shadow">Total Customers<div className="text-xl font-semibold">{customers.length}</div></div>
        <div className="bg-white p-3 rounded shadow">Total Expenses<div className="text-xl font-semibold">{totalExpensesDisplay}</div></div>
        <div className="bg-white p-3 rounded shadow">Inventory Value<div className="text-xl font-semibold">{totalInventoryValueDisplay}</div></div>
        <div className="bg-white p-3 rounded shadow">Low Stock Items<div className="text-xl font-semibold">{lowStockItems.length}</div></div>
        <div className="bg-white p-3 rounded shadow">Inventory Movements<div className="text-xl font-semibold">{movements.length}</div></div>
      </div>

      <div className="bg-white p-3 rounded shadow">
        <div className="font-semibold mb-2">Top Products</div>
        <div className="space-y-2">
          {topProducts.map(([name, qty]) => (
            <div key={name} className="flex justify-between">
              <div>{name}</div>
              <div>{qty} bottles</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <div className="bg-white p-3 rounded shadow">
          <div className="font-semibold mb-2">Recent Expenses</div>
          <div className="space-y-2">
            {expenses.length === 0 && <div className="text-sm text-gray-500">No expenses</div>}
            {expenses.slice(0,6).map(e => (
              <div key={e.id} className="flex justify-between">
                <div>{e.title} • {e.category}</div>
                <div>Rs. {e.amount}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-3 rounded shadow">
          <div className="font-semibold mb-2">Recent Inventory Movements</div>
          <div className="space-y-2">
            {movements.length === 0 && <div className="text-sm text-gray-500">No movements</div>}
            {movements.slice(0,6).map(m => (
              <div key={m.id} className="flex justify-between">
                <div>{m.productName} • {m.type}</div>
                <div>{m.qty > 0 ? `+${m.qty}` : m.qty}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
