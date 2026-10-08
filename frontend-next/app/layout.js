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
