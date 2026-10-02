import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    if (!formData.email.trim()) {
      setError('Please enter your email address.')
      setIsSubmitting(false)
      return
    }

    if (!formData.password) {
      setError('Please enter your password.')
      setIsSubmitting(false)
      return
    }

    const result = await login(formData.email, formData.password)

    if (!result.success) {
      setError(result.message)
      setIsSubmitting(false)
      return
    }

    const destination = location.state?.from || '/'
    navigate(destination, { replace: true })
  }

  return (
    <main className="login-page">
      <div className="login-page__card">
        <div className="login-page__header">
          <span>Welcome Back</span>
          <h1>Login</h1>
          <p>Sign in to your Mercy Gold Honey account.</p>
        </div>

        {error && (
          <div className="login-page__error" role="alert">
            {error}
          </div>
        )}

        <form className="login-page__form" onSubmit={handleSubmit}>
          <div className="login-page__field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="login-page__field">
            <label htmlFor="password">Password</label>
            <div className="login-page__password-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-page__password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-page__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="login-page__footer">
          <span>Don&apos;t have an account?</span>
          <Link to="/register">Create an account</Link>
        </div>
      </div>
    </main>
  )
}

export default Login
