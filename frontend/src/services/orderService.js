import { apiRequest } from './api'

export async function createOrder({
  items,
  shipping_name,
  shipping_phone,
  shipping_address,
  notes,
}) {
  return apiRequest('/api/v1/orders', {
    method: 'POST',
    body: JSON.stringify({
      items,
      shipping_name,
      shipping_phone,
      shipping_address,
      notes,
    }),
  })
}

export async function listMyOrders() {
  return apiRequest('/api/v1/orders')
}

export async function getOrder(id) {
  return apiRequest(`/api/v1/orders/${id}`)
}

export async function lookupOrder({ order_id, phone }) {
  return apiRequest('/api/v1/orders/lookup', {
    method: 'POST',
    body: JSON.stringify({
      order_id: Number(order_id),
      phone: String(phone || '').trim(),
    }),
  })
}

export async function adminListOrders(options = {}) {
  const params = new URLSearchParams()
  if (options.skip != null) params.set('skip', String(options.skip))
  if (options.limit != null) params.set('limit', String(options.limit))
  const qs = params.toString()
  return apiRequest(`/api/v1/admin/orders${qs ? `?${qs}` : ''}`)
}

export async function adminUpdateOrderStatus(id, status) {
  return apiRequest(`/api/v1/admin/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
