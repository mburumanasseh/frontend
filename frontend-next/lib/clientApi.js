'use client'

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
).replace(/\/$/, '')

let refreshInFlight = null

async function tryRefreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Session expired')
        return true
      })
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

export async function apiRequest(path, options = {}, _retried = false) {
  const headers = { ...(options.headers || {}) }
  if (options.body && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  })

  let data = null
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    data = await response.json()
  }

  if (response.status === 401 && !_retried && !path.includes('/auth/')) {
    try {
      await tryRefreshSession()
      return apiRequest(path, options, true)
    } catch {
      /* fall through */
    }
  }

  if (!response.ok) {
    let message = 'Something went wrong'
    if (typeof data?.detail === 'string') message = data.detail
    else if (Array.isArray(data?.detail)) message = data.detail[0]?.msg || message
    else if (data?.message) message = data.message
    if (response.status === 401) message = 'Please log in again.'
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return data
}

export async function loginRequest(email, password) {
  return apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function registerRequest(payload) {
  return apiRequest('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function logoutRequest() {
  try {
    await apiRequest('/api/v1/auth/logout', { method: 'POST' })
  } catch {
    /* ignore */
  }
}

export async function meRequest() {
  return apiRequest('/api/v1/auth/me')
}

export async function createOrder(payload) {
  return apiRequest('/api/v1/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function listMyOrders() {
  return apiRequest('/api/v1/orders')
}

export async function getProductClient(id) {
  return apiRequest(`/api/v1/products/${id}`)
}
