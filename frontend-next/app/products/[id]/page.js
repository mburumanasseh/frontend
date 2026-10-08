import Link from 'next/link'
import { getProduct, listProducts } from '../../../lib/api'

export async function generateStaticParams() {
  try {
    const products = await listProducts()
    return (products || []).map((p) => ({ id: String(p.id) }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }) {
  try {
    const product = await getProduct(params.id)
    return {
      title: product.name,
      description: product.description || `${product.name} from Mercy Gold Honey`,
    }
  } catch {
    return { title: 'Product' }
  }
}

export default async function ProductPage({ params }) {
  let product
  let error = null
  try {
    product = await getProduct(params.id)
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
      <h1>{product.name}</h1>
      {product.size && <p>{product.size}</p>}
      <p className="price">KSh {Number(product.price).toLocaleString()}</p>
      {product.description && <p>{product.description}</p>}
      <p>
        <em>
          Cart and checkout will be wired next — this page is SEO-ready HTML from
          the server.
        </em>
      </p>
    </article>
  )
}
