import Link from 'next/link'

export const metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about Mercy Gold Honey, delivery, guest orders, and payment.',
}

const FAQS = [
  {
    q: 'Is your honey pure and natural?',
    a: 'Yes. Our honey is naturally harvested and selected for quality, aroma, and flavour — no shortcuts.',
  },
  {
    q: 'Do you deliver across Kenya?',
    a: 'Yes. Delivery fees depend on your town or area and are calculated at checkout.',
  },
  {
    q: 'Do I need an account to order?',
    a: 'No. You can place an order as a guest. Creating an account is optional and makes reordering easier.',
  },
  {
    q: 'How do I pay?',
    a: 'You can place your order first. We will confirm payment details with you, including M-Pesa when available.',
  },
  {
    q: 'My honey looks solid — is it still good?',
    a: 'Yes. Natural honey can crystallize over time. Gently warm the jar in clean warm water to return it to a liquid state.',
  },
  {
    q: 'How can I contact you?',
    a: 'Use the WhatsApp button on the site or reach us through the contact details on the About page.',
  },
]

export default function FaqPage() {
  return (
    <div className="faq">
      <div className="container faq__content">
        <span className="faq__eyebrow">Help</span>
        <h1>Frequently asked questions</h1>
        <p className="faq__intro">
          Quick answers about our honey, delivery, and ordering.
        </p>
        <div className="faq__list">
          {FAQS.map((item) => (
            <details key={item.q} className="faq__item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
        <div className="faq__actions">
          <Link href="/shop" className="faq__button">
            Shop honey
          </Link>
          <Link href="/about" className="faq__button faq__button--secondary">
            About us
          </Link>
        </div>
      </div>
    </div>
  )
}
