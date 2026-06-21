import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ALL_PRODUCTS } from '../data/products'
import { PRODUCT_IMAGES } from '../data/productImages'
import { useSEO } from '../hooks/useSEO'

const PRI = '#7B2FBE'

const COMPARE_KEY = 'sbm_compare'

function getCompareList() {
  try { return JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]') } catch { return [] }
}
export function toggleCompare(slug) {
  const list = getCompareList()
  const next = list.includes(slug) ? list.filter(s => s !== slug) : list.length >= 4 ? list : [...list, slug]
  localStorage.setItem(COMPARE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('sbm-compare-change'))
  return next
}
export function isInCompare(slug) { return getCompareList().includes(slug) }

const ATTR_ROWS = [
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'price', label: 'Starting Price', fmt: v => `₦${Number(v).toLocaleString()}` },
  { key: 'moq', label: 'Min. Order Qty', fmt: v => v ? `${v} pcs` : '1 pc' },
  { key: 'deliveryDays', label: 'Delivery', fmt: v => v ? `${v} business days` : '1–3 days' },
]

export default function ComparisonPage() {
  useSEO({ title: 'Compare Products — Sleekblue Media Houz', description: 'Compare our printing and branding products side by side to find the best option for your needs.' })
  const navigate = useNavigate()
  const [slugs, setSlugs] = useState(getCompareList)
  const [overrides, setOverrides] = useState({})

  useEffect(() => {
    const onUpdate = () => setSlugs(getCompareList())
    window.addEventListener('sbm-compare-change', onUpdate)
    return () => window.removeEventListener('sbm-compare-change', onUpdate)
  }, [])

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.ok ? r.json() : {})
      .then(d => setOverrides(d.productOverrides || {}))
      .catch(() => {})
  }, [])

  const products = slugs.map(slug => {
    const base = ALL_PRODUCTS.find(p => p.slug === slug)
    if (!base) return null
    return { ...base, ...(overrides[slug] || {}) }
  }).filter(Boolean)

  if (slugs.length === 0) {
    return (
      <section style={{ background: '#FAF3E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'HubotSans', sans-serif", padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>📊</div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1a1a1a', marginBottom: '12px' }}>No products to compare</h1>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px', lineHeight: 1.6 }}>
            Browse our store and click the <strong>Compare</strong> button on products to add them here. You can compare up to 4 products at once.
          </p>
          <button onClick={() => navigate('/store')}
            style={{ background: PRI, color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 28px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
            Browse Store
          </button>
        </div>
      </section>
    )
  }

  return (
    <section style={{ background: '#FAF3E8', minHeight: '100vh', padding: '40px 24px 80px', fontFamily: "'HubotSans', sans-serif" }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a', margin: '0 0 6px' }}>Product Comparison</h1>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Comparing {products.length} product{products.length !== 1 ? 's' : ''} — up to 4 allowed</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/store')}
              style={{ padding: '9px 20px', background: '#fff', border: `1.5px solid ${PRI}`, borderRadius: '8px', color: PRI, fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              + Add More
            </button>
            <button onClick={() => { localStorage.setItem(COMPARE_KEY, '[]'); setSlugs([]) }}
              style={{ padding: '9px 20px', background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '8px', color: '#dc2626', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              Clear All
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: '16px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '600px' }}>
            {/* Product header row */}
            <thead>
              <tr>
                <th style={{ width: '180px', padding: '20px 18px', background: '#f9f5ff', borderRight: '1px solid #f0f0f0', textAlign: 'left', fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                  Feature
                </th>
                {products.map(p => (
                  <th key={p.slug} style={{ padding: '20px 18px', background: '#f9f5ff', borderRight: '1px solid #f0f0f0', textAlign: 'center', minWidth: '200px' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button onClick={() => { const next = slugs.filter(s => s !== p.slug); localStorage.setItem(COMPARE_KEY, JSON.stringify(next)); setSlugs(next) }}
                        title="Remove from comparison"
                        style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>×</button>
                      <div style={{ width: '90px', height: '90px', borderRadius: '10px', overflow: 'hidden', background: '#f0e8ff', margin: '0 auto 10px' }}>
                        {PRODUCT_IMAGES[p.slug]?.[0]
                          ? <img src={PRODUCT_IMAGES[p.slug][0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🖨️</div>
                        }
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>{p.name}</p>
                      <button onClick={() => navigate(`/store/${p.slug}`)}
                        style={{ background: PRI, color: '#fff', border: 'none', borderRadius: '7px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }}>
                        View Product →
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ATTR_ROWS.map((row, ri) => (
                <tr key={row.key} style={{ background: ri % 2 === 0 ? '#fff' : '#faf5ff' }}>
                  <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: 700, color: '#555', borderRight: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0' }}>
                    {row.label}
                  </td>
                  {products.map(p => {
                    const val = p[row.key]
                    const display = row.fmt ? (val != null ? row.fmt(val) : '—') : (val || '—')
                    return (
                      <td key={p.slug} style={{ padding: '14px 18px', fontSize: '13.5px', color: '#333', textAlign: 'center', borderRight: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0', lineHeight: 1.5 }}>
                        {display}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {/* Action row */}
              <tr style={{ borderTop: '2px solid #e0d6f5' }}>
                <td style={{ padding: '18px', background: '#f9f5ff', borderRight: '1px solid #f0f0f0' }} />
                {products.map(p => (
                  <td key={p.slug} style={{ padding: '18px', textAlign: 'center', background: '#f9f5ff', borderRight: '1px solid #f0f0f0' }}>
                    <button onClick={() => navigate(`/store/${p.slug}`)}
                      style={{ background: PRI, color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 22px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                      Order Now
                    </button>
                    <button onClick={() => navigate('/quote')}
                      style={{ background: '#fff', color: PRI, border: `1.5px solid ${PRI}`, borderRadius: '8px', padding: '9px 22px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', width: '100%', marginTop: '8px' }}>
                      Get Quote
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p style={{ textAlign: 'center', color: '#aaa', fontSize: '12px', marginTop: '24px' }}>
          Can't decide? <a href="/quote" style={{ color: PRI, fontWeight: 600, textDecoration: 'none' }}>Request a custom quote</a> and our team will help you choose the right product.
        </p>
      </div>
    </section>
  )
}
