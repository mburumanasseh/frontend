'use client'

import { useState } from 'react'
import Link from 'next/link'
import { lookupOrder } from '../../lib/clientApi'

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setOrder(null)
    const id = Number(String(orderId).trim())
    if (!id || !phone.trim()) {
      setError('Enter both the order number and the phone used at checkout.')
      return
    }
    setLoading(true)
    try {
      const data = await lookupOrder({ order_id: id, phone: phone.trim() })
      setOrder(data)
    } catch (err) {
      setError(err.message || 'Order not found. Check the number and phone.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="track-page">
      <span className="eyebrow">Orders</span>
      <h1>Track your order</h1>
      <p className="lead">
        Enter the order number from your confirmation and the phone number you
        used at checkout. No account required.
      </p>

      <form className="track-form card" onSubmit={handleSubmit}>
        <label>
          Order number
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="e.g. 42"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
        </label>
        <label>
          Phone used at checkout
          <input
            type="tel"
            autoComplete="tel"
            placeholder="07… or +254…"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Looking up…' : 'Find order'}
        </button>
      </form>

      {order && (
        <article className="track-result card">
          <h2>Order #{order.id}</h2>
          <p>
            Status: <strong className="status-pill">{order.status}</strong>
          </p>
          <p>Total: KSh {Number(order.total_amount).toLocaleString()}</p>
          <p>
            Placed:{' '}
            {order.created_at
              ? new Date(order.created_at).toLocaleString()
              : '—'}
          </p>
          <p className="muted">
            Shipping to {order.shipping_name}, {order.shipping_address}
          </p>
          <ul>
            {(order.items || []).map((item) => (
              <li key={item.id}>
                {item.product_name} × {item.quantity} — KSh{' '}
                {Number(item.line_total).toLocaleString()}
              </li>
            ))}
          </ul>
          <p className="muted">
            Questions? Use WhatsApp or see our <Link href="/faq">FAQ</Link>.
          </p>
        </article>
      )}

      <div className="track-actions">
        <Link href="/shop" className="btn-primary">
          Continue shopping
        </Link>
        <Link href="/orders" className="btn-secondary">
          Logged-in order history
        </Link>
      </div>
    </div>
  )
}
