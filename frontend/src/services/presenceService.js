import { apiRequest, getApiUrl } from './api'

const VISITOR_KEY = 'mercy_gold_visitor_id'

export function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return `v-${Date.now()}`
  }
}

export function setVisitorId(id) {
  try {
    if (id) localStorage.setItem(VISITOR_KEY, id)
  } catch {
    /* ignore */
  }
}

export async function sendHeartbeat(path) {
  const visitor_id = getVisitorId()
  const data = await apiRequest('/api/v1/presence/heartbeat', {
    method: 'POST',
    body: JSON.stringify({ visitor_id, path: path || window.location.pathname }),
  })
  if (data?.visitor_id) setVisitorId(data.visitor_id)
  return data
}

export async function getAdminPresence() {
  return apiRequest('/api/v1/admin/presence')
}
