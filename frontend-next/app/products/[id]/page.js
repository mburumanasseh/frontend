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
      <div>
        <p className="error">{error || 'Product not found'}</p>
        <Link href="/shop">← Back to shop</Link>
      </div>
    )
  }

  return (
    <article>
      <p>
        <Link href="/shop">← Shop</Link>
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.image}
        alt={product.name}
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 12,
          objectFit: 'cover',
        }}
      />
      <h1>{product.name}</h1>
      {product.size && <p className="muted">{product.size}</p>}
      <p className="price">KSh {Number(product.price).toLocaleString()}</p>
      {typeof product.stock === 'number' && (
        <p className="muted">
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
      )}
      {product.description && <p>{product.description}</p>}
      <AddToCartButton product={product} />
    </article>
  )
}
