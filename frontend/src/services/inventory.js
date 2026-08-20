import { getData, setData } from './storage'

const KEY = 'purifly_inventory'

export function getMovements() {
  return getData(KEY) || []
}

export function setMovements(items) {
  setData(KEY, items)
}

export function addMovement(mv) {
  const list = getMovements()
  list.unshift(mv)
  setMovements(list)
}

export function adjustProductStock({ productId, qtyChange, type = 'Adjustment', reason = '', user = 'System' }) {
  const products = getData('purifly_products') || []
  const p = products.find((x) => x.id === productId)
  if (!p) throw new Error('Product not found')
  const prev = Number(p.stock || 0)
  const next = prev + Number(qtyChange || 0)
  if (next < 0) throw new Error('Insufficient stock')
  p.stock = next
  p._lastUpdated = new Date().toISOString()
  setData('purifly_products', products)

  const mv = {
    id: 'M-' + Date.now(),
    productId,
    productName: p.name,
    type,
    qty: qtyChange,
    previousStock: prev,
    newStock: next,
    reason,
    user,
    date: new Date().toISOString()
  }
  addMovement(mv)
  return mv
}
