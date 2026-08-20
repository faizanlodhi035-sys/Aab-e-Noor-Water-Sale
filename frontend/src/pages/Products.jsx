import React, { useEffect, useState } from 'react'
import { apiRequest } from '../api/api'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { Pencil, Trash2, Plus } from 'lucide-react'

function ProductCard({ p, onEdit, onDelete }) {
  const mrp = p.mrp ?? 0
  const selling = p.price ?? 0
  const purchase = p.purchasePrice ?? 0
  const isActive = p.isActive === false ? false : true

  return (
    <div className="bg-white p-3 rounded shadow flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
          {p.image ? (
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-xs text-gray-500">No Image</div>
          )}
        </div>

        <div>
          <div className="font-semibold">
            {p.name}{' '}
            {!isActive && (
              <span className="text-xs text-red-500 ml-2">
                (Inactive)
              </span>
            )}
          </div>

          <div className="text-xs text-gray-500">
            Size: {p.size || p.category || '-'} • Category:{' '}
            {p.category || '-'}
          </div>

          <div className="text-xs text-gray-500">
            MRP: Rs. {mrp} • Sell: Rs. {selling} • Purchase: Rs. {purchase}
          </div>

          <div className="text-xs text-gray-500">
            Stock: {p.stock ?? 0} • Min: {p.minStock ?? 0}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          title="Edit"
          onClick={() => onEdit(p)}
          className="p-2 bg-purifly/10 text-purifly rounded"
        >
          <Pencil size={16} />
        </button>

        <button
          title="Delete"
          onClick={() => onDelete(p)}
          className="p-2 bg-red-50 text-red-500 rounded"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

function Modal({ show, title, onClose, children }) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-2xl p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <div className="font-semibold">{title}</div>

          <button onClick={onClose} className="text-gray-500">
            Close
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const [form, setForm] = useState({
    name: '',
    size: '',
    mrp: '',
    price: '',
    purchasePrice: '',
    initialStock: 0,
    minStock: 0,
    category: '',
    description: '',
    image: '',
  })

  async function loadProducts() {
    try {
      setLoading(true)

      const data = await apiRequest('/products')

      const mapped = (Array.isArray(data) ? data : []).map((p) => ({
        id: p.id,
        name: p.name || '',
        size: p.size || p.unit || '',
        mrp: Number(p.mrp ?? 0),
        price: Number(p.sale_price ?? 0),
        purchasePrice: Number(p.purchase_price ?? 0),
        stock: Number(p.stock_quantity ?? 0),
        minStock: Number(p.minimum_stock ?? 0),
        category: p.category?.name || p.category || '',
        description: p.description || '',
        image: p.image || '',
        isActive: p.status === false || p.status === 0 ? false : true,
        sku: p.sku || '',
        category_id: p.category_id || null,
      }))

      setProducts(mapped)
    } catch (error) {
      console.error('Failed to load products:', error)
      alert(error.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  function openAdd() {
    setEditing(null)

    setForm({
      name: '',
      size: '',
      mrp: '',
      price: '',
      purchasePrice: '',
      initialStock: 0,
      minStock: 0,
      category: '',
      description: '',
      image: '',
    })

    setShowModal(true)
  }

  function openEdit(p) {
    setEditing(p)

    setForm({
      name: p.name || '',
      size: p.size || '',
      mrp: p.mrp ?? 0,
      price: p.price ?? 0,
      purchasePrice: p.purchasePrice ?? 0,
      initialStock: 0,
      minStock: p.minStock ?? 0,
      category: p.category || '',
      description: p.description || '',
      image: p.image || '',
    })

    setShowModal(true)
  }

  function validateForm() {
    if (!form.name || form.name.trim() === '') {
      return 'Product name is required'
    }

    if (!form.size || form.size.trim() === '') {
      return 'Size is required'
    }

    if (!(Number(form.mrp) > 0)) {
      return 'MRP must be greater than 0'
    }

    if (!(Number(form.price) > 0)) {
      return 'Selling Price must be greater than 0'
    }

    if (Number(form.purchasePrice) < 0) {
      return 'Purchase Price cannot be negative'
    }

    if (Number(form.initialStock) < 0) {
      return 'Initial Stock cannot be negative'
    }

    if (Number(form.minStock) < 0) {
      return 'Minimum Stock cannot be negative'
    }

    return null
  }

  async function save() {
    const err = validateForm()

    if (err) {
      alert(err)
      return
    }

    setLoading(true)

    try {
      const payload = {
        name: form.name.trim(),
        sku: editing?.sku || null,
        category_id: editing?.category_id || null,
        unit: form.size,
        purchase_price: Number(form.purchasePrice),
        sale_price: Number(form.price),
        mrp: Number(form.mrp),
        stock_quantity: editing
          ? Number(editing.stock ?? 0)
          : Number(form.initialStock),
        minimum_stock: Number(form.minStock),
        status: true,
      }

      if (editing) {
        const updated = await apiRequest(`/products/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })

        setProducts((prev) =>
          prev.map((p) =>
            p.id === editing.id
              ? {
                  ...p,
                  name: updated.name,
                  size: updated.unit || form.size,
                  mrp: Number(updated.mrp ?? form.mrp),
                  price: Number(updated.sale_price ?? form.price),
                  purchasePrice: Number(
                    updated.purchase_price ?? form.purchasePrice
                  ),
                  stock: Number(updated.stock_quantity ?? editing.stock ?? 0),
                  minStock: Number(
                    updated.minimum_stock ?? form.minStock
                  ),
                  isActive: updated.status !== false,
                }
              : p
          )
        )

        alert('Product updated successfully')
      } else {
        const created = await apiRequest('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        const newProduct = {
          id: created.id,
          name: created.name || form.name,
          size: created.unit || form.size,
          mrp: Number(created.mrp ?? form.mrp),
          price: Number(created.sale_price ?? form.price),
          purchasePrice: Number(
            created.purchase_price ?? form.purchasePrice
          ),
          stock: Number(created.stock_quantity ?? form.initialStock),
          minStock: Number(
            created.minimum_stock ?? form.minStock
          ),
          category: '',
          description: '',
          image: '',
          isActive: created.status !== false,
        }

        setProducts((prev) => [newProduct, ...prev])

        alert('Product added successfully')
      }

      setShowModal(false)
    } catch (error) {
      console.error('Product save failed:', error)
      alert(error.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  async function confirmDelete(p) {
    const confirmed = confirm(
      `Are you sure you want to delete this product?\n\n${p.name}\nCurrent Stock: ${p.stock || 0}`
    )

    if (!confirmed) return

    try {
      setLoading(true)

      await apiRequest(`/products/${p.id}`, {
        method: 'DELETE',
      })

      setProducts((prev) => prev.filter((item) => item.id !== p.id))

      alert('Product deleted successfully')
    } catch (error) {
      console.error('Product delete failed:', error)
      alert(error.message || 'Failed to delete product')
    } finally {
      setLoading(false)
    }
  }

  const filtered = products.filter((p) => {
    if (filter === 'active' && p.isActive === false) return false
    if (filter === 'inactive' && p.isActive !== false) return false

    const term = q.trim().toLowerCase()

    if (!term) return true

    return (
      (p.name || '').toLowerCase().includes(term) ||
      (p.size || '').toLowerCase().includes(term) ||
      (p.category || '').toLowerCase().includes(term)
    )
  })

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Input
          placeholder="Search products, size or category"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-3 py-2 bg-purifly text-white rounded"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="text-sm">Filter:</div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading && (
        <div className="text-sm text-gray-500 mb-2">
          Loading / Saving...
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && !loading && (
          <div className="text-sm text-gray-500">
            No products found
          </div>
        )}

        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            p={p}
            onEdit={openEdit}
            onDelete={confirmDelete}
          />
        ))}
      </div>

      <Modal
        show={showModal}
        title={editing ? 'Edit Product' : 'Add Product'}
        onClose={() => setShowModal(false)}
      >
        <div className="space-y-2">
          <Input
            label="Product Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <Input
            label="Size"
            value={form.size}
            onChange={(e) =>
              setForm({ ...form, size: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="MRP"
              value={form.mrp}
              type="number"
              onChange={(e) =>
                setForm({ ...form, mrp: e.target.value })
              }
            />

            <Input
              label="Selling Price"
              value={form.price}
              type="number"
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Purchase Price"
              value={form.purchasePrice}
              type="number"
              onChange={(e) =>
                setForm({
                  ...form,
                  purchasePrice: e.target.value,
                })
              }
            />

            <Input
              label="Minimum Stock"
              value={form.minStock}
              type="number"
              onChange={(e) =>
                setForm({
                  ...form,
                  minStock: e.target.value,
                })
              }
            />
          </div>

          {!editing && (
            <Input
              label="Initial Stock"
              value={form.initialStock}
              type="number"
              onChange={(e) =>
                setForm({
                  ...form,
                  initialStock: e.target.value,
                })
              }
            />
          )}

          <Input
            label="Category"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          />

          <Input
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

          <Input
            label="Image URL"
            value={form.image}
            onChange={(e) =>
              setForm({
                ...form,
                image: e.target.value,
              })
            }
          />

          <div className="flex justify-end gap-2 mt-3">
            <Button onClick={() => setShowModal(false)}>
              Cancel
            </Button>

            <Button onClick={save}>
              {editing ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
