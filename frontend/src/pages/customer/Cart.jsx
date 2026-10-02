import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/useCart'
import './Cart.css'

function Cart() {
  const {
    cartItems,
    cartSubtotal,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCartFromServer,
    isRefreshing,
  } = useCart()

  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false
    async function sync() {
      const result = await refreshCartFromServer()
      if (cancelled || !result) return
      const parts = []
      if (result.removed?.length) {
        parts.push(`Removed unavailable: ${result.removed.join(', ')}`)
      }
      if (result.adjusted?.length) {
        parts.push(
          result.adjusted
            .map((a) => `${a.name} qty ${a.from}→${a.to}`)
            .join('; '),
        )
      }
      if (parts.length) setNotice(parts.join(' · '))
    }
    sync()
    return () => {
      cancelled = true
    }
  }, [refreshCartFromServer])

  if (cartItems.length === 0 && !isRefreshing) {
    return (
      <main className="cart">
        <div className="container cart__empty">
          <h1>Your Cart</h1>
          <p>
            Your cart is currently empty. Discover something sweet from our
            collection.
          </p>
          <Link to="/shop" className="cart__shop-button">
            Continue Shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="cart">
      <div className="container">
        <div className="cart__header">
          <span>Your Selection</span>
          <div className="cart__header-row">
            <h1>Your Cart</h1>
            <button
              type="button"
              className="cart__clear-button"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>
          <p>Review your honey selection before proceeding to checkout.</p>
          {isRefreshing && <p>Updating prices and stock…</p>}
          {notice && (
            <p className="cart__notice" role="status">
              {notice}
            </p>
          )}
        </div>

        <div className="cart__content">
          <div className="cart__items">
            {cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item__image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item__details">
                  <span>{item.size}</span>
                  <h2>{item.name}</h2>
                  <p>KSh {Number(item.price).toLocaleString()}</p>
                  {typeof item.stock === 'number' && (
                    <p className="cart-item__stock">
                      {item.stock > 0
                        ? `${item.stock} in stock`
                        : 'Out of stock'}
                    </p>
                  )}
                  <div className="cart-item__quantity">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label={`Decrease ${item.name} quantity`}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={
                        typeof item.stock === 'number' &&
                        item.quantity >= item.stock
                      }
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-item__total">
                  <strong>
                    KSh{' '}
                    {(Number(item.price) * item.quantity).toLocaleString()}
                  </strong>
                  <button type="button" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="cart__summary">
            <h2>Order Summary</h2>
            <div className="cart__summary-row">
              <span>Subtotal</span>
              <strong>KSh {Number(cartSubtotal).toLocaleString()}</strong>
            </div>
            <div className="cart__summary-row">
              <span>Delivery</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="cart__summary-total">
              <span>Total</span>
              <strong>KSh {Number(cartSubtotal).toLocaleString()}</strong>
            </div>
            <Link to="/checkout" className="cart__checkout-button">
              Proceed to Checkout
            </Link>
            <Link to="/shop" className="cart__continue">
              ← Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default Cart
