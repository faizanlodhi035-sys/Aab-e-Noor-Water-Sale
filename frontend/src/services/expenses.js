import { getData, setData } from './storage'

const KEY = 'purifly_expenses'

export function getExpenses() {
  return getData(KEY) || []
}

export function setExpenses(items) {
  setData(KEY, items)
}

export function addExpense(exp) {
  const list = getExpenses()
  const next = [{ ...exp, id: 'EXP-' + Date.now(), createdAt: new Date().toISOString() }, ...list]
  setExpenses(next)
  return next[0]
}

export function updateExpense(id, patch) {
  const list = getExpenses()
  const next = list.map((e) => (e.id === id ? { ...e, ...patch } : e))
  setExpenses(next)
  return next.find((e) => e.id === id)
}

export function deleteExpense(id) {
  const list = getExpenses()
  const next = list.filter((e) => e.id !== id)
  setExpenses(next)
}
