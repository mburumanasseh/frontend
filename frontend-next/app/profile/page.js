'use client'

import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'

export default function ProfilePage() {
  const { currentUser, isAuthenticated, loading, logout } = useAuth()

  if (loading) return <p>Loading…</p>

  if (!isAuthenticated) {
    return (
      <div>
        <h1>Profile</h1>
        <p>
          <Link href="/login?next=/profile">Log in</Link> to view your profile.
        </p>
      </div>
    )
  }

  return (
    <div className="container page">
      <h1>Profile</h1>
      <p>
        <strong>Name:</strong> {currentUser.name}
      </p>
      <p>
        <strong>Email:</strong> {currentUser.email}
      </p>
      <p>
        <strong>Phone:</strong> {currentUser.phone || '—'}
      </p>
      <p>
        <Link href="/orders">View orders</Link>
      </p>
      <button type="button" className="btn-primary" onClick={() => logout()}>
        Logout
      </button>
    </div>
  )
}
