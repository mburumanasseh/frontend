import { useCallback, useEffect, useMemo, useState } from 'react'
import { CartContext } from './CartContext'
import { getProduct } from '../services/productService'

const STORAGE_KEY = 'mercy_gold_cart_v1'

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item) => item && item.id != null && Number(item.quantity) > 0)
      .map((item) => ({
        id: item.id,
        name: item.name || 'Product',
        price: Number(item.price) || 0,
        image: item.image || item.image_url || '/honeyjar.jpg',
        size: item.size || '',
        stock: item.stock,
        quantity: Number(item.quantity) || 1,
      }))
  } catch {
    return []
  }
}

function saveCartToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore quota / private mode
  }
}

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => loadCartFromStorage())
  const [hydrated, setHydrated] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveCartToStorage(cartItems)
  }, [cartItems, hydrated])

  const addToCart = (product, quantity = 1) => {
    const qty = Math.max(1, Number(quantity) || 1)
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id)

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item,
        )
      }

      return [
        ...currentItems,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image || product.image_url || '/honeyjar.jpg',
          size: product.size || '',
          stock: product.stock,
          quantity: qty,
        },
      ]
    })
  }

  const removeFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId),
    )
  }

  const updateQuantity = (productId, quantity) => {
    const qty = Number(quantity)
    if (qty < 1) {
      removeFromCart(productId)
      return
    }

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId ? { ...item, quantity: qty } : item,
      ),
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  /**
   * Re-fetch each cart line from the API so price/stock stay accurate.
   * Removes inactive or missing products; clamps qty to available stock.
   */
  const refreshCartFromServer = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const current = loadCartFromStorage()
      if (current.length === 0) {
        setCartItems([])
        return { items: [], removed: [], adjusted: [] }
      }

      const removed = []
      const adjusted = []
      const next = []

      await Promise.all(
        current.map(async (line) => {
          try {
            const product = await getProduct(line.id)
            if (!product || product.is_active === false) {
              removed.push(line.name || String(line.id))
              return
            }
            let quantity = line.quantity
            if (typeof product.stock === 'number' && product.stock < quantity) {
              quantity = Math.max(0, product.stock)
              adjusted.push({
                name: product.name,
                from: line.quantity,
                to: quantity,
              })
            }
            if (quantity < 1) {
              removed.push(product.name)
              return
            }
            next.push({
              id: product.id,
              name: product.name,
              price: Number(product.price),
              image: product.image || product.image_url || '/honeyjar.jpg',
              size: product.size || '',
              stock: product.stock,
              quantity,
            })
          } catch {
            removed.push(line.name || String(line.id))
          }
        }),
      )

      // Preserve a stable order roughly matching previous cart
      const byId = new Map(next.map((i) => [i.id, i]))
      const ordered = []
      for (const line of current) {
        if (byId.has(line.id)) {
          ordered.push(byId.get(line.id))
          byId.delete(line.id)
        }
      }
      for (const rest of byId.values()) ordered.push(rest)

      setCartItems(ordered)
      return { items: ordered, removed, adjusted }
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  )

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0,
      ),
    [cartItems],
  )

  const value = {
    cartItems,
    cartCount,
    cartSubtotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCartFromServer,
    isRefreshing,
  }

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  )
}

export default CartProvider
