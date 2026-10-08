'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
).replace(/\/$/, '')
const VISITOR_KEY = 'mercy_gold_visitor_id'
const INTERVAL_MS = 30_000

function getVisitorId() {
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

export default function PresenceHeartbeat() {
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false

    const beat = () => {
      if (cancelled || document.visibilityState === 'hidden') return
      const visitor_id = getVisitorId()
      fetch(`${API_URL}/api/v1/presence/heartbeat`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor_id, path: pathname || '/' }),
      })
        .then(async (res) => {
          if (!res.ok) return
          const data = await res.json().catch(() => null)
          if (data?.visitor_id) {
            try {
              localStorage.setItem(VISITOR_KEY, data.visitor_id)
            } catch {
              /* ignore */
            }
          }
        })
        .catch(() => {
          /* cold start / offline */
        })
    }

    beat()
    const id = setInterval(beat, INTERVAL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') beat()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [pathname])

  return null
}
