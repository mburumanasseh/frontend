const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function getApiUrl() {
  return API_URL.replace(/\/$/, '')
}

/**
 * Server-friendly fetch (no credentials by default).
 * Use credentials: 'include' only from client components when calling auth endpoints.
 */
export async function apiFetch(path, options = {}) {
  const url = `${getApiUrl()}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    // Allow Next to revalidate product lists periodically
    next: options.next ?? { revalidate: 60 },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `API ${res.status}`)
  }
  return res.json()
}

export async function listProducts() {
  return apiFetch('/api/v1/products')
}

export async function getProduct(id) {
  return apiFetch(`/api/v1/products/${id}`)
}
