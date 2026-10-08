'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'
import { listMyOrders } from '../../lib/clientApi'

export default function OrdersPage() {
  const { isAuthenticated, loading } = useAuth()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      setFetching(false)
      return
    }
    listMyOrders()
      .then((data) => setOrders(data || []))
      .catch((err) => setError(err.message))
      .finally(() => setFetching(false))
  }, [isAuthenticated, loading])

  if (loading || fetching) return <p>Loading…</p>

  if (!isAuthenticated) {
    return (
      <div>
        <h1>My orders</h1>
        <p>
          <Link href="/login?next=/orders">Log in</Link> to see your orders.
        </p>
      </div>
    )
  }

  return (
    <div className="container page">
      <h1>My orders</h1>
      {error && <p className="error">{error}</p>}
      {!orders.length && <p className="muted">No orders yet.</p>}
      {orders.map((order) => (
        <div key={order.id} className="summary-box" style={{ marginBottom: '1rem' }}>
          <strong>#{order.id}</strong> — {order.status}
          <p>
            KSh {Number(order.total_amount).toLocaleString()} ·{' '}
            {order.created_at
              ? new Date(order.created_at).toLocaleString()
              : ''}
          </p>
          <p className="muted">{order.shipping_address}</p>
        </div>
      ))}
    </div>
  )
}
