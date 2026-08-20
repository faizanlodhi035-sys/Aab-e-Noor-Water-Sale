import { getData, setData } from './storage'

const KEY = 'purifly_payments'

export function getPayments() {
  return getData(KEY) || []
}

export function setPayments(items) {
  setData(KEY, items)
}

export function addPayment(p) {
  const list = getPayments()
  const entry = { id: 'PAY-' + Date.now(), date: new Date().toISOString(), ...p }
  setPayments([entry, ...list])
  return entry
}

export function deletePayment(id) {
  const list = getPayments()
  setPayments(list.filter((p) => p.id !== id))
}
