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
        parts.push(`Removed: ${result.removed.join(', ')}`)
      }
      if (result.adjusted?.length) {
        parts.push(
          result.adjusted.map((a) => `${a.name} ${a.from}→${a.to}`).join('; '),
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
      <div>
        <h1>Your cart</h1>
        <p className="muted">Your cart is empty.</p>
        <Link href="/shop" className="btn-primary">
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container page">
      <h1>Your cart</h1>
      {isRefreshing && <p className="muted">Updating prices and stock…</p>}
      {notice && <p className="note">{notice}</p>}
      <div>
        {cartItems.map((item) => (
          <div className="cart-line" key={item.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.name} />
            <div>
              <strong>{item.name}</strong>
              {item.size && <p className="muted">{item.size}</p>}
              <p className="price">KSh {Number(item.price).toLocaleString()}</p>
              <div className="qty-row">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={
                    typeof item.stock === 'number' && item.quantity >= item.stock
                  }
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <strong>
                KSh {(Number(item.price) * item.quantity).toLocaleString()}
              </strong>
              <p>
                <button type="button" className="linkish" onClick={() => removeFromCart(item.id)}>
                  Remove
                </button>
              </p>
            </div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: '1.25rem' }}>
        <strong>Subtotal: KSh {Number(cartSubtotal).toLocaleString()}</strong>
      </p>
      <p className="muted">Delivery calculated at checkout.</p>
      <p style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link href="/checkout" className="btn-primary">
          Proceed to checkout
        </Link>
        <button type="button" className="linkish" onClick={clearCart}>
          Clear cart
        </button>
      </p>
    </div>
  )
}
