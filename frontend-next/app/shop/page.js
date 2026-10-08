import Link from 'next/link'
import { listProducts, normalizeProduct } from '../../lib/api'
import AddToCartButton from '../../components/AddToCartButton'

export const metadata = {
  title: 'Shop',
  description: 'Shop all Mercy Gold Honey products. Pure natural honey in Kenya.',
}

export default async function ShopPage() {
  let products = []
  let error = null
  try {
    const raw = await listProducts()
    products = (raw || []).map(normalizeProduct)
  } catch (e) {
    error = e.message || 'Could not load products'
  }

  return (
    <div>
      <h1>Shop</h1>
      <p className="muted">All available honey from Mercy Gold.</p>
      {error && <p className="error">{error}</p>}
      <div className="product-grid">
        {products.map((p) => (
          <article className="product-card" key={p.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt={p.name} />
            <h2>
              <Link href={`/products/${p.id}`}>{p.name}</Link>
            </h2>
            {p.description && (
              <p className="muted">
                {p.description.length > 100
                  ? `${p.description.slice(0, 100)}…`
                  : p.description}
              </p>
            )}
            {p.size && <p className="muted">{p.size}</p>}
            <p className="price">KSh {Number(p.price).toLocaleString()}</p>
            <AddToCartButton product={p} />
          </article>
        ))}
      </div>
    </div>
  )
}
