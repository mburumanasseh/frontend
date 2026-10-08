import Link from 'next/link'
import { listProducts } from '../../lib/api'

export const metadata = {
  title: 'Shop',
  description: 'Shop all Mercy Gold Honey products. Pure natural honey in Kenya.',
}

export default async function ShopPage() {
  let products = []
  let error = null
  try {
    products = await listProducts()
  } catch (e) {
    error = e.message || 'Could not load products'
  }

  return (
    <div>
      <h1>Shop</h1>
      <p>All available honey from Mercy Gold.</p>
      {error && <p className="error">{error}</p>}
      <div className="product-grid">
        {(products || []).map((p) => (
          <article className="product-card" key={p.id}>
            <h2>
              <Link href={`/products/${p.id}`}>{p.name}</Link>
            </h2>
            {p.description && <p>{p.description}</p>}
            {p.size && <p>{p.size}</p>}
            <p className="price">KSh {Number(p.price).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
