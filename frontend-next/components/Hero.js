import Link from 'next/link'

export default function Hero() {
  return (
    <section className="hero-block">
      <div className="container hero-block__inner">
        <div className="hero-block__text">
          <span className="hero-block__eyebrow">Pure. Natural. Kenyan.</span>
          <h1>Nature&apos;s sweetest gift, straight from the hive.</h1>
          <p>
            Discover naturally harvested honey made with care and delivered
            straight to your doorstep.
          </p>
          <div className="hero-block__actions">
            <Link href="/shop" className="btn-primary">
              Shop Honey
            </Link>
            <a href="#featured" className="btn-secondary">
              Explore Our Honey
            </a>
          </div>
        </div>
        <div className="hero-block__image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/honeyjar.jpg" alt="Jar of natural Mercy Gold honey" />
        </div>
      </div>
    </section>
  )
}
