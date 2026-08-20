export function getData(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    console.error('getData error', e)
    return null
  }
}

export function setData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('setData error', e)
  }
}

export function removeData(key) {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.error('removeData error', e)
  }
}
