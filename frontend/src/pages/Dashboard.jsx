import React, { useContext } from 'react'
import { getData } from '../services/storage'
import { getExpenses } from '../services/expenses'
import { parseAmount, currency } from '../utils/formatters'
import { formatDate } from '../utils/formatters'
import Button from '../components/common/Button'
import { Link } from 'react-router-dom'
import { User, ShoppingCart, Users, Box, Clock } from 'lucide-react'
import { AuthContext } from '../contexts/AuthContext'

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  )
}

function ActionCard({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="flex-1">
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="p-2 bg-purifly/10 text-purifly rounded-lg"><Icon size={18} /></div>
        <div className="text-sm font-semibold">{label}</div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useContext(AuthContext)

  const orders = getData('purifly_orders') || []
  const customers = getData('purifly_customers') || []
  const products = getData('purifly_products') || []

  const newOrders = orders.filter((o) => o.status === 'Pending').length
  const totalOrders = orders.length
  const bottles = orders.reduce((s, o) => s + (o.products?.reduce((ss, p) => ss + p.qty, 0) || 0), 0)
  const totalSales = orders.reduce((s, o) => s + (o.total || 0), 0)

  const expenses = getExpenses() || []

  const todayKey = (d) => new Date(d).toDateString()
  const today = new Date().toDateString()
  const todaysSales = orders
    .filter((o) => todayKey(o.date) === today && o.status !== 'Cancelled')
    .reduce((s, o) => s + (Number(o.total) || 0), 0)
  const todaysExpenses = expenses
    .filter((e) => todayKey(e.date || e.createdAt) === today)
    .reduce((s, e) => s + parseAmount(e.amount), 0)
  const todaysProfit = todaysSales - todaysExpenses

  const lowStockCount = products.filter((p) => Number(p.stock || 0) <= Number(p.minStock || 0)).length

  const totalOutstanding = customers.reduce((s, c) => s + (Number(c.balance ?? c.openingBalance ?? 0) || 0), 0)

  const pendingOrders = orders.filter((o) => o.status === 'Pending').slice(0, 3)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purifly text-white rounded-lg"><User size={28} /></div>
          <div>
            <div className="text-sm text-gray-500">
              {user?.role === 'admin' ? 'Admin' : 'Salesman'}
            </div>

            <div className="text-lg font-bold">
              {user?.name || 'User'}
            </div>

            <div className="text-xs text-gray-500">
              Employee ID: {user?.empId || 'N/A'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard title="Today's Orders" value={String(newOrders).padStart(2, '0')} />
          <StatCard title="Today's Sales" value={currency(todaysSales)} />
          <StatCard title="Today's Expenses" value={currency(todaysExpenses)} />
          <StatCard title="Today's Profit" value={currency(todaysProfit)} />
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatCard title="Total Outstanding" value={currency(totalOutstanding)} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ActionCard to="/orders/new" icon={ShoppingCart} label="New Order" />
        <ActionCard to="/customers" icon={Users} label="Customers" />
        <ActionCard to="/products" icon={Box} label="Products" />
        <ActionCard to="/orders" icon={Clock} label="Order History" />
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Pending Actions</div>
        <div className="space-y-2">
          {pendingOrders.length === 0 && <div className="text-sm text-gray-500">No pending orders</div>}
          {pendingOrders.map((o) => (
            <div key={o.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <div className="font-semibold">{o.customerName}</div>
                <div className="text-xs text-gray-500">{o.id} • {formatDate(o.date)}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">Rs. {o.total}</div>
                <div className="text-xs text-orange-500">{o.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm font-semibold mb-2">Inventory & Expenses</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Low Stock Items</div>
            <div className="text-lg font-semibold mt-1">{lowStockCount}</div>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Recent Expenses</div>
            <div className="space-y-2 mt-2">
              {(expenses.slice(0, 3) || []).map(e => (
                <div key={e.id} className="flex justify-between text-sm">
                  <div>{e.title}</div>
                  <div className="text-right">Rs. {e.amount}</div>
                </div>
              ))}
              {expenses.length === 0 && <div className="text-sm text-gray-500">No expenses</div>}
            </div>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Total Sales (All-time)</div>
            <div className="text-lg font-semibold mt-1">Rs. {totalSales}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
