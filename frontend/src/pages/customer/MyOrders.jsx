import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { listMyOrders } from '../../services/orderService'
import './Shop.css'

function MyOrders() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await listMyOrders()
        if (!cancelled) setOrders(data || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load orders')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, authLoading])

  if (authLoading || loading) {
    return (
      <main className="shop-page">
        <div className="container">
          <p>Loading orders…</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="shop-page">
        <div className="container">
          <h1>My orders</h1>
          <p>
            Please <Link to="/login">log in</Link> to see orders linked to your
            account, or <Link to="/track">track a guest order</Link> with your
            order number and phone.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="shop-page">
      <section className="shop-page__header">
        <div className="container">
          <span className="shop-page__eyebrow">Account</span>
          <h1>My orders</h1>
          <p>Track orders you have placed with Mercy Gold Honey.</p>
        </div>
      </section>
      <section className="shop-page__products">
        <div className="container">
          {error && <p role="alert">{error}</p>}
          {orders.length === 0 ? (
            <p>
              No orders yet. <Link to="/shop">Browse honey</Link>
            </p>
          ) : (
            <div className="shop-page__grid" style={{ display: 'block' }}>
              {orders.map((order) => (
                <article
                  key={order.id}
                  style={{
                    marginBottom: '1.25rem',
                    padding: '1rem',
                    border: '1px solid #e8e0d0',
                    borderRadius: '12px',
                    background: '#fff',
                  }}
                >
                  <h3>Order #{order.id}</h3>
                  <p>
                    Status: <strong>{order.status}</strong>
                  </p>
                  <p>Total: KSh {Number(order.total_amount).toLocaleString()}</p>
                  <p>
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString()
                      : ''}
                  </p>
                  <ul>
                    {(order.items || []).map((item) => (
                      <li key={item.id}>
                        {item.product_name} × {item.quantity} — KSh{' '}
                        {Number(item.line_total).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default MyOrders
