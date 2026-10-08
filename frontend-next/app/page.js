import Link from 'next/link'
import { listProducts } from '../lib/api'

export const metadata = {
  title: 'Home',
  description:
    'Mercy Gold Honey — premium natural honey. Browse our featured jars.',
}

export default async function HomePage() {
  let products = []
  let error = null
  try {
    products = await listProducts()
  } catch (e) {
    error = e.message || 'Could not load products'
  }

  const featured = (products || []).slice(0, 3)

  return (
    <div>
      <section className="hero">
        <h1>Mercy Gold Honey</h1>
        <p>
          Pure, natural honey crafted with care. Shop forest and wildflower
          varieties — server-rendered for search engines, powered by our FastAPI
          backend.
        </p>
        <p>
          <Link href="/shop">Browse all honey →</Link>
        </p>
      </section>

      <section>
        <h2>Featured</h2>
        {error && <p className="error">{error}</p>}
        {!error && featured.length === 0 && <p>No products yet.</p>}
        <div className="product-grid">
          {featured.map((p) => (
            <article className="product-card" key={p.id}>
              <h2>
                <Link href={`/products/${p.id}`}>{p.name}</Link>
              </h2>
              {p.size && <p>{p.size}</p>}
              <p className="price">
                KSh {Number(p.price).toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
