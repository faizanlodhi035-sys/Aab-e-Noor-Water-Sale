export function currency(n) {
  const num = Number(n) || 0
  const abs = Math.abs(num)
  const formatted = abs.toLocaleString()
  return num < 0 ? `-Rs. ${formatted}` : `Rs. ${formatted}`
}

export function formatDate(dateStr) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString()
  } catch (e) {
    return dateStr
  }
}

export function parseAmount(value) {
  if (value == null) return 0
  const s = String(value).trim()
  if (s === '') return 0
  // remove any currency symbols, spaces and thousands separators
  const cleaned = s.replace(/[^0-9.\-]/g, '')
  const n = Number(cleaned)
  return Number.isNaN(n) ? 0 : n
}
