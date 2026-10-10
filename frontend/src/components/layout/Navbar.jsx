import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/useCart'
import { useAuth } from '../../context/useAuth'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const { cartCount } = useCart()
  const { currentUser, isAuthenticated, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container navbar__content">
        <Link to="/" className="navbar__brand" aria-label="Mercy Gold Honey home">
          <img
            src="/mercy-gold-logo.jpg"
            alt="Mercy Gold Honey"
            className="navbar__logo"
          />
        </Link>

        <nav className="navbar__links" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/cart">
            Cart
            {cartCount > 0 && (
              <span className="navbar__cart-count">{cartCount}</span>
            )}
          </Link>
        </nav>

        <div className="navbar__actions">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="navbar__account">
                {currentUser.name}
              </Link>
              <button type="button" className="navbar__logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar__account">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
