import { useState } from 'react'
import { Link } from 'react-router-dom'
import { lookupOrder } from '../../services/orderService'
import './TrackOrder.css'

function TrackOrder() {
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
    <main className="track-order">
      <div className="container track-order__content">
        <span className="track-order__eyebrow">Orders</span>
        <h1>Track your order</h1>
        <p className="track-order__intro">
          Enter the order number from your confirmation and the phone number
          you used at checkout. No account required.
        </p>

        <form className="track-order__form" onSubmit={handleSubmit}>
          <div className="track-order__field">
            <label htmlFor="track-order-id">Order number</label>
            <input
              id="track-order-id"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 42"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          <div className="track-order__field">
            <label htmlFor="track-phone">Phone used at checkout</label>
            <input
              id="track-phone"
              type="tel"
              autoComplete="tel"
              placeholder="07… or +254…"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {error && (
            <p className="track-order__error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="track-order__submit" disabled={loading}>
            {loading ? 'Looking up…' : 'Find order'}
          </button>
        </form>

        {order && (
          <article className="track-order__result">
            <h2>Order #{order.id}</h2>
            <p>
              Status: <strong className="track-order__status">{order.status}</strong>
            </p>
            <p>Total: KSh {Number(order.total_amount).toLocaleString()}</p>
            <p>
              Placed:{' '}
              {order.created_at
                ? new Date(order.created_at).toLocaleString()
                : '—'}
            </p>
            <p className="track-order__ship">
              Shipping to {order.shipping_name}, {order.shipping_address}
            </p>
            <ul className="track-order__items">
              {(order.items || []).map((item) => (
                <li key={item.id}>
                  {item.product_name} × {item.quantity} — KSh{' '}
                  {Number(item.line_total).toLocaleString()}
                </li>
              ))}
            </ul>
            <p className="track-order__hint">
              Questions? Use the WhatsApp button or see our{' '}
              <Link to="/faq">FAQ</Link>.
            </p>
          </article>
        )}

        <div className="track-order__actions">
          <Link to="/shop" className="track-order__link">
            Continue shopping
          </Link>
          <Link to="/orders" className="track-order__link track-order__link--muted">
            Logged-in order history
          </Link>
        </div>
      </div>
    </main>
  )
}

export default TrackOrder
