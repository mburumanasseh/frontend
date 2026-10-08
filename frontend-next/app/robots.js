export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/cart', '/checkout', '/login', '/register', '/orders', '/profile'],
    },
    sitemap: 'https://mercygold.co.ke/sitemap.xml',
  }
}
