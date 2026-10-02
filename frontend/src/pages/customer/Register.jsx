import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import './Register.css'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

    if (!formData.name.trim()) {
      setError('Please enter your full name.')
      setIsSubmitting(false)
      return
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address.')
      setIsSubmitting(false)
      return
    }

    if (!formData.phone.trim()) {
      setError('Please enter your phone number.')
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 6) {
      setError(
        'Password must be at least 6 characters long.',
      )
      setIsSubmitting(false)
      return
    }

    if (
      formData.password !== formData.confirmPassword
    ) {
      setError('Passwords do not match.')
      setIsSubmitting(false)
      return
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    })

    if (!result.success) {
      setError(result.message)
      setIsSubmitting(false)
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <main className="register-page">
      <div className="register-page__card">
        <div className="register-page__header">
          <span>Join Mercy Gold Honey</span>

          <h1>Create Account</h1>

          <p>
            Create an account to manage your orders and
            shopping experience.
          </p>
        </div>

        {error && (
          <div
            className="register-page__error"
            role="alert"
          >
            {error}
          </div>
        )}

        <form
          className="register-page__form"
          onSubmit={handleSubmit}
        >
          <div className="register-page__field">
            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              autoComplete="name"
            />
          </div>

          <div className="register-page__field">
            <label htmlFor="email">
              Email Address
            </label>

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

          <div className="register-page__field">
            <label htmlFor="phone">
              Phone Number
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="07XX XXX XXX"
              autoComplete="tel"
            />
          </div>

          <div className="register-page__field">
            <label htmlFor="password">
              Password
            </label>

            <div className="register-page__password-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="register-page__password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="register-page__field">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <div className="register-page__password-wrap">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Enter your password again"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="register-page__password-toggle"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="register-page__submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Creating Account...'
              : 'Create Account'}
          </button>
        </form>

        <div className="register-page__footer">
          <span>Already have an account?</span>

          <Link to="/login">
            Login
          </Link>
        </div>
      </div>
    </main>
  )
}

export default Register