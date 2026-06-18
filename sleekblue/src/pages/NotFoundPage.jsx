import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ALL_PRODUCTS } from '../data/products'
import { PRODUCT_IMAGES } from '../data/productImages'

const POPULAR = ['die-cut-stickers','flex-banner','flyers-posters','business-card','rollup-stand','t-shirts']

export default function NotFoundPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = '404 — Page Not Found | Sleekblue Media Houz'
  }, [])

  const popular = POPULAR
    .map(slug => ALL_PRODUCTS.find(p => p.slug === slug))
    .filter(Boolean)

  return (
    <div style={{ minHeight: '80vh', background: '#fafafa', fontFamily: "'HubotSans', sans-serif" }}>
      {/* Hero block */}
      <div style={{ background: 'linear-gradient(135deg, #7B2FBE 0%, #5a1f8a 100%)', color: '#fff', padding: '64px 24px 48px', textAlign: 'center' }}>
        <div style={{ fontSize: '80px', lineHeight: 1, marginBottom: '16px', userSelect: 'none' }}>404</div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 10px' }}>Oops! This page doesn't exist</h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.78)', margin: '0 0 28px', maxWidth: '480px', marginInline: 'auto' }}>
          The link may have been moved, renamed, or may never have existed. Let's get you back on track.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/')}
            style={{ background: '#F4A621', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 26px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: "'HubotSans', sans-serif" }}>
            🏠 Go Home
          </button>
          <button onClick={() => navigate('/store')}
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '10px', padding: '12px 26px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: "'HubotSans', sans-serif" }}>
            🛍️ Browse Store
          </button>
          <button onClick={() => navigate('/quote')}
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '10px', padding: '12px 26px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: "'HubotSans', sans-serif" }}>
            📝 Request a Quote
          </button>
        </div>
      </div>

      {/* Popular products */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px 64px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a1a', margin: '0 0 6px', textAlign: 'center' }}>Popular Products</h2>
        <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', margin: '0 0 28px' }}>Thousands of happy customers order these every week</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '18px' }}>
          {popular.map(product => {
            const imgs = PRODUCT_IMAGES[product.slug] || []
            const img = imgs[0]
            return (
              <Link key={product.slug} to={`/store/${product.slug}`}
                style={{ textDecoration: 'none', background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1.5px solid #f0eaf8', display: 'block', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(123,47,190,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.07)' }}>
                <div style={{ aspectRatio: '3/2', background: '#f0eaf8', overflow: 'hidden' }}>
                  {img
                    ? <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🖨️</div>
                  }
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>{product.name}</p>
                  <p style={{ fontSize: '11.5px', color: '#7B2FBE', fontWeight: 600, margin: 0 }}>{product.tagline || 'Premium quality printing'}</p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick links */}
        <div style={{ marginTop: '48px', background: '#fff', borderRadius: '16px', padding: '28px 24px', border: '1.5px solid #f0eaf8', textAlign: 'center' }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px' }}>Still need help?</p>
          <p style={{ fontSize: '13px', color: '#888', margin: '0 0 18px' }}>Our team is always ready to assist you with your printing needs.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://wa.me/2348065275264" target="_blank" rel="noreferrer"
              style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', textDecoration: 'none', fontFamily: "'HubotSans', sans-serif" }}>
              💬 WhatsApp Us
            </a>
            <a href="mailto:info@sleekbluemediahouz.com"
              style={{ background: '#7B2FBE', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', textDecoration: 'none', fontFamily: "'HubotSans', sans-serif" }}>
              ✉️ Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
