import { listProducts } from '../lib/api'

const BASE = 'https://mercygold.co.ke'

export default async function sitemap() {
  const staticRoutes = ['', '/shop'].map((path) => ({
    url: `${BASE}${path || '/'}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.9,
  }))

  let productRoutes = []
  try {
    const products = await listProducts()
    productRoutes = (products || []).map((p) => ({
      url: `${BASE}/products/${p.id}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch {
    /* API down at build time */
  }

  return [...staticRoutes, ...productRoutes]
}
