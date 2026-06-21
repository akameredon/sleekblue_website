import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ALL_PRODUCTS } from '../data/products'
import { PRODUCT_IMAGES } from '../data/productImages'
import { useSEO } from '../hooks/useSEO'
import Breadcrumb from '../components/Breadcrumb'

const PRI = '#7B2FBE'

const CATEGORIES = [
  { key: 'all',       label: 'All Products' },
  { key: 'Flex Printing/Large Format', label: 'Flex & Large Format' },
  { key: 'Label Stickers',             label: 'Label Stickers' },
  { key: 'Corporate Branding',         label: 'Corporate Branding' },
]

function useWishlist() {
  const KEY = 'sbm_wishlist'
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
  })
  function toggle(slug) {
    setWishlist(prev => {
      const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
      try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }
  return { wishlist, toggle }
}

export default function StorePage() {
  const navigate = useNavigate()
  useSEO('store', { title: 'Our Store — Sleekblue Media Houz', description: 'Shop all our printing and branding products — die-cut stickers, flex banners, business cards, t-shirts and more. Fast delivery across Nigeria.' })

  const [activeCat, setActiveCat] = useState('all')
  const [search, setSearch] = useState('')
  const { wishlist, toggle } = useWishlist()

  const filtered = ALL_PRODUCTS.filter(p => {
    const matchCat = activeCat === 'all' || p.category === activeCat
    const q = search.trim().toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  const displayCategories = activeCat === 'all'
    ? ['Flex Printing/Large Format', 'Label Stickers', 'Corporate Branding']
    : [activeCat]

  return (
    <section style={{ background: '#FAF3E8', padding: '32px 16px 60px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Store' }]} />
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a', textTransform: 'uppercase', marginBottom: '6px', fontFamily: "'HubotSans', sans-serif" }}>Our Store</h1>
        <p style={{ fontSize: '13px', color: '#777', marginBottom: '20px', fontWeight: 400 }}>Browse all our printing and branding products</p>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setActiveCat(c.key)}
                style={{ padding: '8px 18px', borderRadius: '20px', border: `1.5px solid ${activeCat === c.key ? PRI : '#ddd'}`,
                  background: activeCat === c.key ? PRI : '#fff', color: activeCat === c.key ? '#fff' : '#555',
                  fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', fontFamily: "'HubotSans', sans-serif",
                  transition: 'all 0.15s' }}>
                {c.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 180, maxWidth: 300, position: 'relative' }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search products…"
              style={{ width: '100%', padding: '8px 14px', border: '1.5px solid #ddd', borderRadius: '20px',
                fontSize: '13px', outline: 'none', fontFamily: "'HubotSans', sans-serif", boxSizing: 'border-box' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '16px' }}>×</button>
            )}
          </div>
          {wishlist.length > 0 && (
            <div style={{ fontSize: '12px', color: '#e53e3e', fontWeight: 600 }}>
              ❤️ {wishlist.length} saved
            </div>
          )}
        </div>

        {/* Results count */}
        {search && (
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<strong>{search}</strong>"
          </p>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#555' }}>No products found</p>
            <p style={{ fontSize: '13px' }}>Try a different search or category</p>
            <button onClick={() => { setSearch(''); setActiveCat('all') }}
              style={{ marginTop: '12px', padding: '9px 22px', background: PRI, color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 600 }}>
              Clear filters
            </button>
          </div>
        )}

        {displayCategories.map(cat => {
          const items = filtered.filter(p => p.category === cat)
          if (items.length === 0) return null
          return (
            <div key={cat} style={{ marginBottom: '44px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: PRI, fontFamily: "'HubotSans', sans-serif" }}>{cat}</h2>
                <div style={{ flex: 1, height: '1px', background: '#e0d6f5' }} />
                <span style={{ fontSize: '12px', color: '#aaa' }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="store-grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
                {items.map(product => {
                  const imgs = PRODUCT_IMAGES[product.slug] || []
                  const inWishlist = wishlist.includes(product.slug)
                  return (
                    <div key={product.id} style={{ background: '#fff', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', border: '1px solid #eee', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'box-shadow 0.2s', position: 'relative' }}
                      onClick={() => navigate(`/store/${product.slug}`)}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 18px rgba(123,47,190,0.13)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'}>

                      {/* Wishlist heart */}
                      <button
                        onClick={e => { e.stopPropagation(); toggle(product.slug) }}
                        title={inWishlist ? 'Remove from saved' : 'Save for later'}
                        style={{ position: 'absolute', top: 8, right: 8, background: inWishlist ? '#fef2f2' : 'rgba(255,255,255,0.9)', border: `1px solid ${inWishlist ? '#fca5a5' : '#eee'}`, borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', zIndex: 2, transition: 'all 0.15s' }}>
                        {inWishlist ? '❤️' : '🤍'}
                      </button>

                      <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: '8px', overflow: 'hidden', background: '#C8C8C8' }}>
                        {imgs[0] ? (
                          <img src={imgs[0]} alt={product.name} loading="lazy" decoding="async"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: '#C8C8C8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🖨️</div>
                        )}
                      </div>
                      <p style={{ fontSize: '12.5px', fontWeight: 700, color: '#1a1a1a', textAlign: 'center', fontFamily: "'HubotSans', sans-serif", margin: 0 }}>{product.name}</p>
                      <p style={{ fontSize: '12px', color: PRI, fontWeight: 600, margin: 0 }}>From ₦{product.price.toLocaleString()}</p>
                      <button
                        style={{ background: PRI, color: '#fff', border: 'none', borderRadius: '20px', padding: '7px 0', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', width: '85%', fontFamily: "'HubotSans', sans-serif" }}
                        onClick={e => { e.stopPropagation(); navigate(`/store/${product.slug}`) }}>
                        Shop Now
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Wishlist panel */}
        {wishlist.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '14px', padding: '20px 24px', boxShadow: '0 2px 12px rgba(123,47,190,0.10)', border: '1.5px solid #e0d6f5', marginTop: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: PRI, margin: '0 0 14px', fontFamily: "'HubotSans', sans-serif" }}>❤️ Your Saved Items ({wishlist.length})</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {wishlist.map(slug => {
                const p = ALL_PRODUCTS.find(x => x.slug === slug)
                if (!p) return null
                return (
                  <div key={slug} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f9f5ff', border: '1px solid #e0d6f5', borderRadius: '20px', padding: '6px 12px 6px 6px' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', background: '#e0d6f5' }}>
                      {PRODUCT_IMAGES[slug]?.[0] && <img src={PRODUCT_IMAGES[slug][0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer' }} onClick={() => navigate(`/store/${slug}`)}>{p.name}</span>
                    <button onClick={() => toggle(slug)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '14px', padding: 0, lineHeight: 1 }}>×</button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) { .store-grid-5 { grid-template-columns: repeat(4, 1fr) !important; } }
        @media (max-width: 768px)  { .store-grid-5 { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 480px)  { .store-grid-5 { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  )
}
