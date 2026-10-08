import { apiRequest } from './api'

export async function listCustomers(options = {}) {
  const params = new URLSearchParams()
  if (options.limit) params.set('limit', String(options.limit))
  if (options.skip) params.set('skip', String(options.skip))
  const qs = params.toString()
  return apiRequest(`/api/v1/admin/customers${qs ? `?${qs}` : ''}`)
}

export async function getStoreSettings() {
  return apiRequest('/api/v1/admin/settings')
}

export async function updateStoreSettings(payload) {
  return apiRequest('/api/v1/admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}


export async function getAdminPresence() {
  return apiRequest('/api/v1/admin/presence')
}
