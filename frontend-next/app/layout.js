import './globals.css'

export const metadata = {
  title: {
    default: 'Mercy Gold Honey',
    template: '%s | Mercy Gold Honey',
  },
  description:
    'Premium natural honey from Mercy Gold Honey. Shop pure forest and wildflower honey in Kenya.',
  metadataBase: new URL('https://mercygold.co.ke'),
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <a href="/" className="brand">
            Mercy Gold Honey
          </a>
          <nav>
            <a href="/">Home</a>
            <a href="/shop">Shop</a>
          </nav>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          <p>© {new Date().getFullYear()} Mercy Gold Honey</p>
        </footer>
      </body>
    </html>
  )
}
