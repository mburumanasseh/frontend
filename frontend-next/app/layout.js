import './globals.css'
import Providers from '../components/Providers'
import Header from '../components/Header'
import PresenceHeartbeat from '../components/PresenceHeartbeat'

export const metadata = {
  title: {
    default: 'Mercy Gold Honey',
    template: '%s | Mercy Gold Honey',
  },
  description:
    'Premium natural honey from Mercy Gold Honey. Shop pure forest and wildflower honey in Kenya.',
  metadataBase: new URL('https://mercygold.co.ke'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <PresenceHeartbeat />
          <Header />
          <main className="site-main">{children}</main>
          <footer className="site-footer">
            <div className="container">
              <p>© {new Date().getFullYear()} Mercy Gold Honey · Pure. Natural. Kenyan.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
