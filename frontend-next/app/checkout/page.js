'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { createOrder } from '../../lib/clientApi'
import calculateDeliveryFee from '../../lib/delivery'

export default function CheckoutPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser, loading: authLoading } = useAuth()
  const { cartItems, cartSubtotal, clearCart, refreshCartFromServer } = useCart()

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    county: '',
    town: '',
    address: '',
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)

  useEffect(() => {
    if (!currentUser) return
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || currentUser.name || '',
      phone: prev.phone || currentUser.phone || '',
    }))
  }, [currentUser])

  const deliveryFee = calculateDeliveryFee(formData.town)
  const total = cartSubtotal + deliveryFee
  const hasAccount = Boolean(isAuthenticated && currentUser)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((d) => ({ ...d, [name]: value }))
    setErrors((err) => ({ ...err, [name]: '' }))
  }

  const validate = () => {
    const next = {}
    if (!formData.fullName.trim()) next.fullName = 'Required'
    if (!formData.phone.trim()) next.phone = 'Required'
    if (!formData.county.trim()) next.county = 'Required'
    if (!formData.town.trim()) next.town = 'Required'
    if (!formData.address.trim()) next.address = 'Required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    if (!validate()) return
    if (!isAuthenticated) {
      router.push('/login?next=/checkout')
      return
    }
    setIsSubmitting(true)
    try {
      const sync = await refreshCartFromServer()
      if (sync?.removed?.length) {
        setSubmitError(
          'Some items are unavailable and were removed. Review your cart and try again.',
        )
        setIsSubmitting(false)
        return
      }
      const lines = sync?.items?.length ? sync.items : cartItems
      if (!lines.length) {
        setSubmitError('Your cart is empty.')
        setIsSubmitting(false)
        return
      }
      const shippingAddress = [
        formData.address.trim(),
        formData.town.trim(),
        formData.county.trim(),
      ]
        .filter(Boolean)
        .join(', ')

      const order = await createOrder({
        items: lines.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        shipping_name: formData.fullName.trim(),
        shipping_phone: formData.phone.trim(),
        shipping_address: shippingAddress,
        notes: `Delivery: ${formData.town}, ${formData.county}. Fee KSh ${deliveryFee}`,
      })
      clearCart()
      setOrderSuccess(order)
    } catch (err) {
      setSubmitError(err.message || 'Could not place order')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) return <p>Loading…</p>

  if (orderSuccess) {
    return (
      <div>
        <h1>Order placed</h1>
        <p className="success">
          Order #{orderSuccess.id} is <strong>{orderSuccess.status}</strong>.
          No online payment required yet — we will follow up about delivery.
        </p>
        <p>
          Total: KSh {Number(orderSuccess.total_amount).toLocaleString()}
        </p>
        <Link href="/shop" className="btn-primary">
          Continue shopping
        </Link>
      </div>
    )
  }

  if (!cartItems.length) {
    return (
      <div>
        <h1>Checkout</h1>
        <p className="muted">Your cart is empty.</p>
        <Link href="/shop">Browse honey</Link>
      </div>
    )
  }

  return (
    <div className="container page">
      <h1>Checkout</h1>
      <p className="muted">
        {hasAccount
          ? 'We filled name and phone from your account — add delivery details.'
          : 'Log in required to place an order.'}
      </p>
      {!isAuthenticated && (
        <p className="note">
          <Link href="/login?next=/checkout">Log in</Link> or{' '}
          <Link href="/register">create an account</Link> to continue.
        </p>
      )}

      <form className="checkout-grid" onSubmit={handleSubmit}>
        <div>
          {submitError && <p className="error">{submitError}</p>}
          {hasAccount && (
            <p className="note">
              Signed in as <strong>{currentUser.email}</strong>
            </p>
          )}
          <div className="form">
            <label>
              Full name
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                readOnly={hasAccount && Boolean(currentUser?.name)}
              />
              {errors.fullName && <small className="error">{errors.fullName}</small>}
            </label>
            <label>
              Phone
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                readOnly={hasAccount && Boolean(currentUser?.phone)}
              />
              {errors.phone && <small className="error">{errors.phone}</small>}
            </label>
            <label>
              County
              <input name="county" value={formData.county} onChange={handleChange} />
              {errors.county && <small className="error">{errors.county}</small>}
            </label>
            <label>
              Town / area
              <input name="town" value={formData.town} onChange={handleChange} />
              {errors.town && <small className="error">{errors.town}</small>}
            </label>
            <label>
              Delivery address
              <textarea
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
              />
              {errors.address && <small className="error">{errors.address}</small>}
            </label>
            <div className="note">
              <strong>No payment required now.</strong> Place your order and we
              will confirm delivery and payment (including M-Pesa when available).
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !isAuthenticated}
            >
              {isSubmitting ? 'Placing order…' : 'Place order'}
            </button>
          </div>
        </div>

        <aside className="summary-box">
          <h2>Order summary</h2>
          {cartItems.map((item) => (
            <p key={item.id}>
              {item.name} × {item.quantity} — KSh{' '}
              {(Number(item.price) * item.quantity).toLocaleString()}
            </p>
          ))}
          <p>Subtotal: KSh {Number(cartSubtotal).toLocaleString()}</p>
          <p>Delivery: KSh {Number(deliveryFee).toLocaleString()}</p>
          <p>
            <strong>Total: KSh {Number(total).toLocaleString()}</strong>
          </p>
        </aside>
      </form>
    </div>
  )
}
