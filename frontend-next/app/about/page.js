import Link from 'next/link'

export const metadata = {
  title: 'About',
  description:
    'Learn about Mercy Gold Honey — pure, naturally harvested Kenyan honey from hive to doorstep.',
}

export default function AboutPage() {
  return (
    <div className="about">
      <div className="container about__content">
        <span className="about__eyebrow">Our Story</span>
        <h1>About Mercy Gold Honey</h1>
        <p>
          Mercy Gold Honey is dedicated to bringing you pure, naturally harvested
          honey straight from the hive. We work with local beekeepers who care for
          healthy colonies and harvest with respect for the bees and the land.
        </p>
        <p>
          From forest hives to wildflower meadows, every jar is chosen for quality,
          aroma, and flavour. No shortcuts — just honest honey for your table.
        </p>
        <p>
          Whether you prefer a delicate floral note or a rich, bold forest honey,
          we are here to help you find the right jar.
        </p>
        <div className="about__actions">
          <Link href="/shop" className="about__button">
            Shop our honey
          </Link>
          <Link href="/faq" className="about__button about__button--secondary">
            Read FAQs
          </Link>
        </div>
      </div>
    </div>
  )
}
