import Link from 'next/link'
import { listProducts, normalizeProduct } from '../lib/api'
import AddToCartButton from '../components/AddToCartButton'

export const metadata = {
  title: 'Home',
  description:
    'Mercy Gold Honey — premium natural honey in Kenya. Browse featured jars.',
}

export default async function HomePage() {
  let products = []
  let error = null
  try {
    const raw = await listProducts()
    products = (raw || []).map(normalizeProduct)
  } catch (e) {
    error = e.message || 'Could not load products'
  }

  const featured = products.slice(0, 3)

  return (
    <div>
      <section className="hero">
        <h1>Mercy Gold Honey</h1>
        <p>
          Pure, natural honey crafted with care. Shop forest and wildflower
          varieties across Kenya.
        </p>
        <p>
          <Link href="/shop" className="btn-primary">
            Browse all honey
          </Link>
        </p>
      </section>

      <section>
        <h2>Featured</h2>
        {error && <p className="error">{error}</p>}
        {!error && featured.length === 0 && (
          <p className="muted">No products yet.</p>
        )}
        <div className="product-grid">
          {featured.map((p) => (
            <article className="product-card" key={p.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} />
              <h2>
                <Link href={`/products/${p.id}`}>{p.name}</Link>
              </h2>
              {p.size && <p className="muted">{p.size}</p>}
              <p className="price">KSh {Number(p.price).toLocaleString()}</p>
              <AddToCartButton product={p} />
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
