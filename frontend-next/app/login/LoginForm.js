'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await login(email, password)
    setSubmitting(false)
    if (!result.success) {
      setError(result.message)
      return
    }
    const next = searchParams.get('next') || '/'
    router.push(next)
  }

  return (
    <div className="container page">
      <h1>Login</h1>
      <p className="muted">Sign in to your Mercy Gold Honey account.</p>
      {error && <p className="error">{error}</p>}
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label>
          Password
          <div className="password-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
        </label>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Login'}
        </button>
      </form>
      <p className="muted" style={{ marginTop: '1rem' }}>
        No account? <Link href="/register">Create one</Link>
      </p>
    </div>
  )
}
