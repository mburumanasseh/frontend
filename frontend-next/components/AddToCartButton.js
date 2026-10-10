'use client'

import { useState } from 'react'
import { useCart } from '../context/CartContext'

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleClick = () => {
    addToCart(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  const disabled = typeof product.stock === 'number' && product.stock < 1

  return (
    <button
      type="button"
      className="btn-primary"
      onClick={handleClick}
      disabled={disabled}
    >
      {disabled ? 'Out of stock' : added ? 'Added to cart ✓' : 'Add to cart'}
    </button>
  )
}
