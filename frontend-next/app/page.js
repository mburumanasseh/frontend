import Link from 'next/link'
import Hero from '../components/Hero'
import AddToCartButton from '../components/AddToCartButton'
import { listProducts, normalizeProduct } from '../lib/api'

export const metadata = {
  title: 'Home',
  description:
    'Mercy Gold Honey — premium natural Kenyan honey. Pure forest and wildflower honey delivered to your door.',
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

  const featured = products.slice(0, 6)

  return (
    <div>
      <Hero />

      <section id="featured" className="featured-section">
        <div className="featured-section__header">
          <span>Our Selection</span>
          <h2>Featured Honey</h2>
          <p>
            Discover some of our finest honey, carefully selected for quality
            and natural flavor.
          </p>
        </div>

        {error && <p className="error">{error}</p>}
        {!error && featured.length === 0 && (
          <p className="muted">No products yet. Check back soon.</p>
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

        {featured.length > 0 && (
          <p className="featured-section__more">
            <Link href="/shop" className="btn-secondary">
              View all products →
            </Link>
          </p>
        )}
      </section>
    </div>
  )
}
