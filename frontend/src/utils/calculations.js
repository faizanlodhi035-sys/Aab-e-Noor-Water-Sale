export function lineTotal(price, qty) {
  return price * qty
}

export function subtotal(items) {
  return items.reduce((s, it) => s + it.price * it.qty, 0)
}

export function totalItems(items) {
  return items.reduce((s, it) => s + it.qty, 0)
}
