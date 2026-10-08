'use client'

import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Header() {
  const { currentUser, isAuthenticated, logout } = useAuth()
  const { cartCount } = useCart()

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mercy-gold-logo.jpg"
          alt="Mercy Gold Honey"
          className="brand-logo"
        />
      </Link>
      <nav className="site-nav">
        <Link href="/">Home</Link>
        <Link href="/shop">Shop</Link>
        <Link href="/cart">
          Cart{cartCount > 0 ? ` (${cartCount})` : ''}
        </Link>
        {isAuthenticated ? (
          <>
            <Link href="/orders">Orders</Link>
            <Link href="/profile">{currentUser?.name || 'Account'}</Link>
            <button type="button" className="linkish" onClick={() => logout()}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </nav>
    </header>
  )
}
