import React, { useEffect, useState } from 'react'
import { getData, setData } from '../services/storage'
import { getMovements, adjustProductStock } from '../services/inventory'
import Button from '../components/common/Button'
import { Boxes, AlertTriangle } from 'lucide-react'

function StatusBadge({ stock, min }) {
  if (stock <= 0) return <span className="text-xs text-white bg-red-600 px-2 py-0.5 rounded">OUT</span>
  if (stock < min) return <span className="text-xs text-white bg-yellow-500 px-2 py-0.5 rounded">LOW</span>
  return <span className="text-xs text-white bg-green-600 px-2 py-0.5 rounded">IN</span>
}

export default function Inventory() {
  const [products, setProducts] = useState(getData('purifly_products') || [])
  const [movements, setMovements] = useState(getMovements())
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState(0)

  useEffect(() => {
    setProducts(getData('purifly_products') || [])
    setMovements(getMovements())
  }, [])

  function refresh() {
    setProducts(getData('purifly_products') || [])
    setMovements(getMovements())
  }

  function handleAddStock(p) {
    if (!qty || Number(qty) <= 0) return alert('Quantity must be > 0')
    try {
      adjustProductStock({ productId: p.id, qtyChange: Number(qty), type: 'Stock In', reason: 'Manual Stock In', user: 'Sales' })
      setQty(0)
      refresh()
    } catch (e) {
      alert(e.message)
    }
  }

  const totalProducts = products.length
  const totalStock = products.reduce((s, p) => s + Number(p.stock || 0), 0)
  const lowStock = products.filter((p) => Number(p.stock || 0) > 0 && Number(p.stock) < Number(p.minStock || 0)).length
  const outStock = products.filter((p) => Number(p.stock || 0) <= 0).length
  const stockValue = products.reduce((s, p) => s + (Number(p.stock || 0) * Number(p.price || p.price || 0)), 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="card">
          <div className="text-xs text-gray-500">Total Products</div>
          <div className="text-xl font-semibold">{totalProducts}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500">Total Stock</div>
          <div className="text-xl font-semibold">{totalStock}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500">Low Stock</div>
          <div className="text-xl font-semibold">{lowStock}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500">Out of Stock</div>
          <div className="text-xl font-semibold">{outStock}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500">Stock Value</div>
          <div className="text-xl font-semibold">Rs. {stockValue}</div>
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Products</div>
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded"><Boxes size={24} /></div>
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-gray-500">MRP: Rs. {p.price} • Size: {p.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">Stock: <span className="font-semibold">{p.stock}</span></div>
                <div><StatusBadge stock={p.stock} min={p.minStock || 0} /></div>
                <div>
                  <input value={selected === p.id ? qty : ''} onChange={(e) => { setSelected(p.id); setQty(e.target.value) }} placeholder="Qty" className="w-20 p-2 border rounded" />
                </div>
                <div>
                  <Button onClick={() => handleAddStock(p)}>Add Stock</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Recent Stock Movements</div>
        <div className="space-y-2">
          {movements.length === 0 && <div className="text-sm text-gray-500">No movements</div>}
          {movements.slice(0, 10).map((m) => (
            <div key={m.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between">
              <div>
                <div className="font-semibold">{m.productName} • {m.type}</div>
                <div className="text-xs text-gray-500">{m.reason}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{m.qty > 0 ? '+' + m.qty : m.qty}</div>
                <div className="text-xs text-gray-500">{new Date(m.date).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
