import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { sendHeartbeat } from '../services/presenceService'

const INTERVAL_MS = 30_000

/**
 * Pings the API while the site is open so admin can see online counts.
 */
function PresenceHeartbeat() {
  const location = useLocation()

  useEffect(() => {
    let cancelled = false

    const beat = () => {
      if (cancelled || document.visibilityState === 'hidden') return
      sendHeartbeat(location.pathname).catch(() => {
        /* offline / cold start — ignore */
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
  }, [location.pathname])

  return null
}

export default PresenceHeartbeat
