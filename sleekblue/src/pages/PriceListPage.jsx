import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ALL_PRODUCTS } from '../data/products.js'
import Breadcrumb from '../components/Breadcrumb.jsx'
import useSEO from '../hooks/useSEO.js'

const PRI = '#7B2FBE'

function formatPrice(n) {
  return '₦' + Math.round(n).toLocaleString('en-NG')
}

const PRODUCT_CATEGORIES = [
  { label: 'Stickers & Labels', slugs: ['die-cut-stickers', 'product-labels'] },
  { label: 'Banners & Stands', slugs: ['flex-banner', 'backlit-banner', 'canvas-banner', 'rollup-stand', 'double-sided-rollup', 'x-banner', 'pop-up-banner'] },
  { label: 'Print Materials', slugs: ['flyers-posters', 'business-card', 'letterhead', 'compliment-slip', 'invoice-receipt', 'burial-brochure'] },
  { label: 'Clothing & Merchandise', slugs: ['t-shirts', 't-shirt-cap', 'branded-bags'] },
  { label: 'Outdoor & Branding', slugs: ['vehicle-branding', 'signage', 'billboard'] },
  { label: 'Design Services', slugs: ['graphic-design', 'brand-identity', 'social-media-design', 'packaging-design'] },
]

export default function PriceListPage() {
  useSEO({
    title: 'Price List — Sleekblue Media Houz | Print & Branding Prices Nigeria',
    description: 'View our full printable price list for stickers, banners, business cards, T-shirts, vehicle branding and more. Best printing prices in Nigeria.',
    canonical: 'https://sleekbluemediahouz.com/price-list',
  })

  const crumbs = [{ label: 'Home', path: '/' }, { label: 'Price List' }]

  function handlePrint() { window.print() }

  return (
    <div style={{ background: '#f9f8ff', minHeight: '100vh', fontFamily: "'HubotSans',sans-serif" }}>
      <div className="no-print" style={{ padding: '18px 0 0', maxWidth: '1100px', margin: '0 auto', paddingInline: '20px' }}>
        <Breadcrumb crumbs={crumbs} />
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 60px' }}>
        {/* Header */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0 20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1a1a1a', margin: '0 0 6px' }}>
              Price List
            </h1>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
              All prices shown are starting prices. Final quote depends on quantity, size, and finishes.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={handlePrint}
              style={{ padding: '11px 22px', background: PRI, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: "'HubotSans',sans-serif" }}>
              🖨️ Print / Save PDF
            </button>
            <Link to="/quote"
              style={{ padding: '11px 22px', background: '#FF6B00', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', textDecoration: 'none', fontFamily: "'HubotSans',sans-serif" }}>
              Get Custom Quote →
            </Link>
          </div>
        </div>

        {/* Print header */}
        <div className="print-only" style={{ display: 'none', textAlign: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #7B2FBE' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#7B2FBE', margin: '0 0 4px' }}>Sleekblue Media Houz</h1>
          <p style={{ color: '#666', fontSize: '13px', margin: '0 0 2px' }}>Premium Printing & Branding | Lagos, Nigeria</p>
          <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>📞 +234 806 527 5264 | sleekbluemediahouz.com</p>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a1a', margin: '16px 0 0' }}>PRICE LIST {new Date().getFullYear()}</h2>
          <p style={{ color: '#888', fontSize: '11px', margin: '4px 0 0' }}>Prices are starting from. Final price depends on quantity, size, and specification.</p>
        </div>

        {/* Category tables */}
        {PRODUCT_CATEGORIES.map(cat => {
          const products = cat.slugs
            .map(slug => ALL_PRODUCTS.find(p => p.slug === slug))
            .filter(Boolean)
          if (!products.length) return null

          return (
            <div key={cat.label} style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: PRI, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderLeft: `4px solid ${PRI}`, paddingLeft: '12px' }}>
                {cat.label}
              </h2>
              <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #ede9f8' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: `${PRI}10` }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#1a1a1a', fontFamily: "'HubotSans',sans-serif" }}>Product</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#555' }}>Min Qty</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#555' }}>Starting From</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#555' }}>Unit Price (at min)</th>
                      <th className="no-print" style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#555' }}>Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, i) => {
                      const firstTier = product.priceTable?.[0]
                      const startPrice = firstTier ? firstTier.unitPrice * firstTier.qty : product.price || 0
                      const unitPrice = firstTier?.unitPrice || 0
                      const minQty = firstTier?.qty || 1

                      return (
                        <tr key={product.slug} style={{ borderTop: i > 0 ? '1px solid #f0f0f0' : 'none' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#faf8ff'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '13px 16px' }}>
                            <div style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: '2px', fontFamily: "'HubotSans',sans-serif" }}>{product.name}</div>
                            {product.tagline && <div style={{ fontSize: '11px', color: '#888', fontFamily: "'HubotSans',sans-serif" }}>{product.tagline}</div>}
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'center', color: '#666' }}>
                            {minQty > 1 ? `${minQty} pcs` : '1 pc'}
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'right', fontWeight: 800, color: PRI, fontSize: '14px', fontFamily: "'HubotSans',sans-serif" }}>
                            {startPrice > 0 ? formatPrice(startPrice) : 'Get Quote'}
                          </td>
                          <td style={{ padding: '13px 16px', textAlign: 'right', color: '#666', fontSize: '12px' }}>
                            {unitPrice > 0 ? `${formatPrice(unitPrice)} / pc` : '—'}
                          </td>
                          <td className="no-print" style={{ padding: '13px 16px', textAlign: 'center' }}>
                            <Link to={`/store/${product.slug}`}
                              style={{ padding: '7px 14px', background: `${PRI}10`, color: PRI, borderRadius: '7px', fontWeight: 700, fontSize: '12px', textDecoration: 'none', border: `1px solid ${PRI}30`, whiteSpace: 'nowrap', fontFamily: "'HubotSans',sans-serif", display: 'inline-block' }}>
                              Order →
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}

        {/* Bulk discount notice */}
        <div style={{ background: `${PRI}08`, border: `1.5px solid ${PRI}20`, borderRadius: '12px', padding: '20px 24px', marginTop: '8px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '28px' }}>💡</span>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: PRI, margin: '0 0 6px', fontFamily: "'HubotSans',sans-serif" }}>Bulk Discounts Available</h3>
            <p style={{ fontSize: '13px', color: '#555', margin: '0 0 10px', lineHeight: 1.6, fontFamily: "'HubotSans',sans-serif" }}>
              The more you order, the lower the unit price. All prices shown are starting (minimum quantity) prices. 
              For large orders, corporate packages, or custom quotes contact us directly.
            </p>
            <div className="no-print" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a href="https://wa.me/2348065275264?text=Hi%20Sleekblue%2C%20I%20need%20a%20bulk%20quote" target="_blank" rel="noreferrer"
                style={{ padding: '9px 18px', background: '#25D366', color: '#fff', borderRadius: '8px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', fontFamily: "'HubotSans',sans-serif" }}>
                💬 WhatsApp for Bulk Quote
              </a>
              <Link to="/quote"
                style={{ padding: '9px 18px', background: PRI, color: '#fff', borderRadius: '8px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', fontFamily: "'HubotSans',sans-serif" }}>
                📝 Submit a Quote Request
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: #fff; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  )
}
