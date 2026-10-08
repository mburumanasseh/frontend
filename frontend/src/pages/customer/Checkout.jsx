import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/useCart'
import { useAuth } from '../../context/useAuth'
import calculateDeliveryFee from '../../services/deliveryService'
import { createOrder } from '../../services/orderService'
import './Checkout.css'

function Checkout() {
  const { cartItems, cartSubtotal, clearCart, refreshCartFromServer } = useCart()
  const { isAuthenticated, currentUser } = useAuth()

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

  // Prefill name + phone from account (collected at registration)
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
  const hasAccountDetails = Boolean(isAuthenticated && currentUser)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Please enter your full name.'
    if (!formData.phone.trim()) newErrors.phone = 'Please enter your phone number.'
    if (!formData.county.trim()) newErrors.county = 'Please enter your county.'
    if (!formData.town.trim()) newErrors.town = 'Please enter your town or area.'
    if (!formData.address.trim()) newErrors.address = 'Please enter your delivery address.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Refresh price/stock right before placing the order
      const sync = await refreshCartFromServer()
      if (sync?.removed?.length) {
        setSubmitError(
          'Some items are no longer available and were removed from your cart. Please review and try again.',
        )
        setIsSubmitting(false)
        return
      }
      if (sync?.items !== undefined && sync.items.length === 0) {
        setSubmitError('Your cart is empty after updating stock. Please add products again.')
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

      const lines = sync?.items?.length ? sync.items : cartItems
      const order = await createOrder({
        items: lines.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        shipping_name: formData.fullName.trim(),
        shipping_phone: formData.phone.trim(),
        shipping_address: shippingAddress,
        notes: `Delivery: ${formData.town.trim()}, ${formData.county.trim()}. Fee KSh ${deliveryFee}`,
      })

      clearCart()
      setOrderSuccess(order)
    } catch (err) {
      setSubmitError(err.message || 'Could not place order')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderSuccess) {
    return (
      <main className="checkout">
        <div className="container checkout__empty">
          <h1>Order placed</h1>
          <p>
            Thank you. Your order #{orderSuccess.id} was received and is{' '}
            <strong>{orderSuccess.status}</strong>. You do not need to pay online
            yet — we will follow up about delivery and payment.
          </p>
          <p>
            Total: KSh {Number(orderSuccess.total_amount).toLocaleString()}
          </p>
          <Link to="/shop" className="checkout__shop-button">
            Continue shopping
          </Link>
        </div>
      </main>
    )
  }

  if (cartItems.length === 0) {
    return (
      <main className="checkout">
        <div className="container checkout__empty">
          <h1>Your Cart Is Empty</h1>
          <p>Add some honey to your cart before proceeding to checkout.</p>
          <Link to="/shop" className="checkout__shop-button">
            Browse Honey
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="checkout">
      <div className="container">
        <div className="checkout__header">
          <span>Almost There</span>
          <h1>Checkout</h1>
          <p>
            {hasAccountDetails
              ? 'We filled in your account details — just add where to deliver.'
              : "Enter your details — no account required."}
          </p>
        </div>

        <form className="checkout__content" onSubmit={handleSubmit}>
          <section className="checkout__form-section">
            <div className="checkout__card">
              <h2>Delivery details</h2>
              {submitError && (
                <p className="checkout__error" role="alert">
                  {submitError}
                </p>
              )}

              {!isAuthenticated && (
                <p className="checkout__account-note">
                  You can order as a guest. Optional:{' '}
                  <Link to="/login">log in</Link> or{' '}
                  <Link to="/register">create an account</Link> to save your
                  details for next time.
                </p>
              )}

              {hasAccountDetails && (
                <p className="checkout__account-note">
                  Signed in as <strong>{currentUser.email}</strong>. Name and
                  phone come from your account
                  {currentUser.phone ? '' : ' (add a phone if missing)'}.
                </p>
              )}

              <div className="checkout__fields">
                <div className="checkout__field">
                  <label htmlFor="fullName">Full name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    readOnly={hasAccountDetails && Boolean(currentUser?.name)}
                    className={
                      hasAccountDetails && currentUser?.name
                        ? 'checkout__input--filled'
                        : undefined
                    }
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                  {errors.fullName && <small>{errors.fullName}</small>}
                </div>

                <div className="checkout__field">
                  <label htmlFor="phone">Phone number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    readOnly={hasAccountDetails && Boolean(currentUser?.phone)}
                    className={
                      hasAccountDetails && currentUser?.phone
                        ? 'checkout__input--filled'
                        : undefined
                    }
                    placeholder="07XX XXX XXX"
                    autoComplete="tel"
                  />
                  {errors.phone && <small>{errors.phone}</small>}
                </div>

                <div className="checkout__field">
                  <label htmlFor="county">County</label>
                  <input
                    id="county"
                    name="county"
                    type="text"
                    value={formData.county}
                    onChange={handleChange}
                    placeholder="e.g. Nairobi"
                    autoComplete="address-level1"
                  />
                  {errors.county && <small>{errors.county}</small>}
                </div>

                <div className="checkout__field">
                  <label htmlFor="town">Town / Area</label>
                  <input
                    id="town"
                    name="town"
                    type="text"
                    value={formData.town}
                    onChange={handleChange}
                    placeholder="e.g. Westlands"
                    autoComplete="address-level2"
                  />
                  {errors.town && <small>{errors.town}</small>}
                </div>

                <div className="checkout__field checkout__field--full">
                  <label htmlFor="address">Delivery address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street, building, landmark…"
                    rows="4"
                    autoComplete="street-address"
                  />
                  {errors.address && <small>{errors.address}</small>}
                </div>
              </div>

              <div className="checkout__pay-later">
                <p>
                  <strong>No payment required now.</strong> Place your order and
                  we will confirm delivery and payment details with you
                  (including M-Pesa when available).
                </p>
              </div>

              <button
                type="submit"
                className="checkout__submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Placing order…' : 'Place order'}
              </button>
            </div>
          </section>

          <aside className="checkout__summary">
            <div className="checkout__card">
              <h2>Order summary</h2>
              <div className="checkout__items">
                {cartItems.map((item) => (
                  <div className="checkout__item" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {item.quantity} × KSh{' '}
                        {Number(item.price).toLocaleString()}
                      </span>
                    </div>
                    <strong>
                      KSh{' '}
                      {(Number(item.price) * item.quantity).toLocaleString()}
                    </strong>
                  </div>
                ))}
              </div>
              <div className="checkout__totals">
                <div>
                  <span>Subtotal</span>
                  <span>KSh {Number(cartSubtotal).toLocaleString()}</span>
                </div>
                <div>
                  <span>Delivery</span>
                  <span>KSh {Number(deliveryFee).toLocaleString()}</span>
                </div>
                <div className="checkout__total">
                  <span>Total</span>
                  <span>KSh {Number(total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  )
}

export default Checkout
