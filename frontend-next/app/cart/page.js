'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart } from '../../context/CartContext'

export default function CartPage() {
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
    ;(async () => {
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
    })()
    return () => {
      cancelled = true
    }
  }, [refreshCartFromServer])

  if (!cartItems.length && !isRefreshing) {
    return (
      <div className="container page cart-empty">
        <span className="page-eyebrow">Your Selection</span>
        <h1>Your cart is empty</h1>
        <p className="muted">
          Discover something sweet from our collection, then return here to
          checkout — you can place an order with or without an account.
        </p>
        <Link href="/shop" className="btn-primary">
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container page">
      <div className="cart-header">
        <span className="page-eyebrow">Your Selection</span>
        <div className="cart-header__row">
          <h1>Your Cart</h1>
          <button type="button" className="linkish" onClick={clearCart}>
            Clear cart
          </button>
        </div>
        <p className="muted">
          Review your honey before checkout. No login required to place an
          order.
        </p>
        {isRefreshing && <p className="muted">Updating prices and stock…</p>}
        {notice && (
          <p className="note" role="status">
            {notice}
          </p>
        )}
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div className="cart-line" key={item.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.name} />
              <div className="cart-line__details">
                {item.size && <span className="muted">{item.size}</span>}
                <strong>
                  <Link href={`/products/${item.id}`}>{item.name}</Link>
                </strong>
                <p className="price">
                  KSh {Number(item.price).toLocaleString()}
                </p>
                {typeof item.stock === 'number' && (
                  <p className="muted">
                    {item.stock > 0
                      ? `${item.stock} in stock`
                      : 'Out of stock'}
                  </p>
                )}
                <div className="qty-row">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label={`Decrease ${item.name}`}
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
                    aria-label={`Increase ${item.name}`}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="cart-line__total">
                <strong>
                  KSh{' '}
                  {(Number(item.price) * item.quantity).toLocaleString()}
                </strong>
                <button
                  type="button"
                  className="linkish"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="cart-summary summary-box">
          <h2>Order summary</h2>
          <div className="checkout__summary-row">
            <span>Subtotal</span>
            <strong>KSh {Number(cartSubtotal).toLocaleString()}</strong>
          </div>
          <div className="checkout__summary-row">
            <span>Delivery</span>
            <span className="muted">Calculated at checkout</span>
          </div>
          <div className="checkout__summary-total">
            <span>Total</span>
            <strong>KSh {Number(cartSubtotal).toLocaleString()}</strong>
          </div>
          <Link href="/checkout" className="btn-primary cart-summary__cta">
            Proceed to checkout
          </Link>
          <Link href="/shop" className="cart-summary__back">
            ← Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  )
}
