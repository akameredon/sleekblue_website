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
      <section className="bg-slate-50 min-h-screen flex items-center justify-center font-[HubotSans] px-4 py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="text-[56px] mb-5">📊</div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">No products to compare</h1>
          <p className="text-sm text-slate-500 leading-7 mb-8">
            Browse our store and click the <strong>Compare</strong> button on products to add them here. You can compare up to 4 products at once.
          </p>
          <button onClick={() => navigate('/store')}
            className="rounded-2xl bg-violet-700 px-7 py-3 text-sm font-bold text-white transition hover:bg-violet-800">
            Browse Store
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-slate-50 min-h-screen py-10 font-[HubotSans] px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Product Comparison</h1>
            <p className="text-sm text-slate-500 mt-2">Comparing {products.length} product{products.length !== 1 ? 's' : ''} — up to 4 allowed</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/store')}
              className="rounded-2xl border border-violet-700 bg-white px-5 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50">
              + Add More
            </button>
            <button onClick={() => { localStorage.setItem(COMPARE_KEY, '[]'); setSlugs([]) }}
              className="rounded-2xl border border-rose-300 bg-rose-50 px-5 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100">
              Clear All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
          <table className="min-w-[600px] w-full border-collapse bg-white text-sm">
            <thead>
              <tr>
                <th className="w-[180px] px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-500 bg-violet-50 border-r border-slate-200">
                  Feature
                </th>
                {products.map(p => (
                  <th key={p.slug} className="min-w-[200px] px-5 py-4 text-center bg-violet-50 border-r border-slate-200">
                    <div className="relative inline-block">
                      <button onClick={() => { const next = slugs.filter(s => s !== p.slug); localStorage.setItem(COMPARE_KEY, JSON.stringify(next)); setSlugs(next) }}
                        title="Remove from comparison"
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-50 text-rose-600 text-xs font-bold shadow-sm">
                        ×
                      </button>
                      <div className="mx-auto mb-2 h-[90px] w-[90px] overflow-hidden rounded-2xl bg-violet-100">
                        {PRODUCT_IMAGES[p.slug]?.[0]
                          ? <img src={PRODUCT_IMAGES[p.slug][0]} alt={p.name} className="h-full w-full object-cover" />
                          : <div className="flex h-full w-full items-center justify-center text-2xl">🖨️</div>
                        }
                      </div>
                      <p className="text-sm font-bold text-slate-900 mb-2">{p.name}</p>
                      <button onClick={() => navigate(`/store/${p.slug}`)}
                        className="rounded-2xl bg-violet-700 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-violet-800">
                        View Product →
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ATTR_ROWS.map((row, ri) => (
                <tr key={row.key} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-5 py-4 text-left font-semibold text-slate-700 border-r border-slate-200">
                    {row.label}
                  </td>
                  {products.map(p => {
                    const val = p[row.key]
                    const display = row.fmt ? (val != null ? row.fmt(val) : '—') : (val || '—')
                    return (
                      <td key={p.slug} className="px-5 py-4 text-center text-slate-700 border-r border-slate-200 leading-6">
                        {display}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr className="border-t border-slate-200 bg-violet-50">
                <td className="px-5 py-4 border-r border-slate-200" />
                {products.map(p => (
                  <td key={p.slug} className="px-5 py-4 text-center border-r border-slate-200 space-y-3">
                    <button onClick={() => navigate(`/store/${p.slug}`)}
                      className="w-full rounded-2xl bg-violet-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-800">
                      Order Now
                    </button>
                    <button onClick={() => navigate('/quote')}
                      className="w-full rounded-2xl border border-violet-700 bg-white px-4 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50">
                      Get Quote
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Can't decide? <a href="/quote" className="font-semibold text-violet-700">Request a custom quote</a> and our team will help you choose the right product.
        </p>
      </div>
    </section>
  )
}
