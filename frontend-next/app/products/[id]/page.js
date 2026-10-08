import Link from 'next/link'
import { getProduct, listProducts, normalizeProduct } from '../../../lib/api'
import AddToCartButton from '../../../components/AddToCartButton'

export async function generateStaticParams() {
  try {
    const products = await listProducts()
    return (products || []).map((p) => ({ id: String(p.id) }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }) {
  const id = params?.id
  try {
    const product = await getProduct(id)
    return {
      title: product.name,
      description:
        product.description || `${product.name} from Mercy Gold Honey`,
    }
  } catch {
    return { title: 'Product' }
  }
}

export default async function ProductPage({ params }) {
  const id = params?.id
  let product
  let error = null
  try {
    product = normalizeProduct(await getProduct(id))
  } catch (e) {
    error = e.message || 'Product not found'
  }

  if (error || !product) {
    return (
      <div className="container page">
        <p className="error">{error || 'Product not found'}</p>
        <Link href="/shop">← Back to shop</Link>
      </div>
    )
  }

  return (
    <div className="container">
      <p style={{ paddingTop: '1.5rem' }}>
        <Link href="/shop">← Shop</Link>
      </p>
      <article className="product-detail">
        <div className="product-detail__image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-detail__info">
          <h1>{product.name}</h1>
          {product.size && <p className="muted">{product.size}</p>}
          <p className="price">KSh {Number(product.price).toLocaleString()}</p>
          {typeof product.stock === 'number' && (
            <p className="muted">
              {product.stock > 0
                ? `${product.stock} in stock`
                : 'Out of stock'}
            </p>
          )}
          {product.description && (
            <p style={{ marginTop: '1rem', lineHeight: 1.7 }}>
              {product.description}
            </p>
          )}
          <AddToCartButton product={product} />
        </div>
      </article>
    </div>
  )
}
