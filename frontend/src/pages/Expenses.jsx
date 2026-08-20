import React, { useEffect, useState } from 'react'
import { getExpenses, addExpense, updateExpense, deleteExpense } from '../services/expenses'
import Input from '../components/common/Input'
import Button from '../components/common/Button'

const CATEGORIES = ['Fuel','Transport','Salary','Electricity','Water','Rent','Maintenance','Office Supplies','Packaging','Loading/Unloading','Delivery','Vehicle','Marketing','Other']
const PAYMENT = ['Cash','Bank','Easypaisa','JazzCash','Other']

export default function Expenses() {
  const [list, setList] = useState(getExpenses())
  const [form, setForm] = useState({ title: '', category: 'Other', amount: '', date: '', payment: 'Cash', paidBy: '', description: '', reference: '' })

  useEffect(() => setList(getExpenses()), [])

  function onAdd() {
    if (!form.title || !form.amount || Number(form.amount) <= 0) return alert('Title and amount required')
    addExpense(form)
    setForm({ title: '', category: 'Other', amount: '', date: '', payment: 'Cash', paidBy: '', description: '', reference: '' })
    setList(getExpenses())
  }

  function onDelete(id) {
    if (!confirm('Delete expense?')) return
    deleteExpense(id)
    setList(getExpenses())
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <div className="text-sm font-semibold mb-2">Add Expense</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div>
            <label className="block text-sm">Category</label>
            <select className="w-full p-2 border rounded" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Input label="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div>
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm">Payment</label>
            <select className="w-full p-2 border rounded" value={form.payment} onChange={(e) => setForm({ ...form, payment: e.target.value })}>
              {PAYMENT.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <Input label="Paid By" value={form.paidBy} onChange={(e) => setForm({ ...form, paidBy: e.target.value })} />
          </div>
          <div className="md:col-span-3">
            <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button onClick={onAdd}>Add Expense</Button>
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Expenses</div>
        <div className="space-y-2">
          {list.length === 0 && <div className="text-sm text-gray-500">No expenses</div>}
          {list.map(e => (
            <div key={e.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between">
              <div>
                <div className="font-semibold">{e.title} • {e.category}</div>
                <div className="text-xs text-gray-500">{e.paidBy} • {e.payment} • {e.date || new Date(e.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">Rs. {e.amount}</div>
                <div className="flex gap-2 justify-end mt-2">
                  <button onClick={() => onDelete(e.id)} className="text-xs text-red-500">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
