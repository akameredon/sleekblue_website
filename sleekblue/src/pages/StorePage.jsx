/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, no-unused-vars, no-empty, no-dupe-keys */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ALL_PRODUCTS } from '../data/products'
import { PRODUCT_IMAGES } from '../data/productImages'
import { useSEO } from '../hooks/useSEO'
import Breadcrumb from '../components/Breadcrumb'

const PRI = '#7B2FBE'

const CATEGORIES = [
  { key: 'all', label: 'All Products' },
  { key: 'Flex Printing/Large Format', label: 'Flex & Large Format' },
  { key: 'Label Stickers', label: 'Label Stickers' },
  { key: 'Corporate Branding', label: 'Corporate Branding' },
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
  useSEO('store', {
    title: 'Our Store — Sleekblue Media Houz',
    description: 'Shop all our printing and branding products — die-cut stickers, flex banners, business cards and more. Fast delivery across Nigeria.',
  })

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
    <section className="bg-[#FAF3E8] min-h-screen px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-[1280px]">
        <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Store' }]} />
        <h1 className="mt-8 text-3xl font-extrabold uppercase text-[#1a1a1a] sm:text-4xl">Our Store</h1>
        <p className="mt-2 text-sm text-slate-600">Browse all our printing and branding products</p>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => setActiveCat(c.key)}
                type="button"
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${activeCat === c.key ? 'border-[#7B2FBE] bg-[#7B2FBE] text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-[#7B2FBE] hover:text-[#7B2FBE]'}`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-[340px]">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search products…"
              className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-lg text-slate-400 transition hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>

          {wishlist.length > 0 && (
            <div className="text-sm font-semibold text-rose-600">❤️ {wishlist.length} saved</div>
          )}
        </div>

        {search && (
          <p className="mt-4 text-sm text-slate-500">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<strong className="font-semibold text-slate-800">{search}</strong>"
          </p>
        )}

        {filtered.length === 0 && (
          <div className="mt-10 rounded-[28px] bg-white p-10 text-center text-slate-600 shadow-sm">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-base font-semibold text-slate-700">No products found</p>
            <p className="mt-2 text-sm">Try a different search or category</p>
            <button
              type="button"
              onClick={() => { setSearch(''); setActiveCat('all') }}
              className="mt-5 inline-flex rounded-full bg-[#7B2FBE] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6b23ba]"
            >
              Clear filters
            </button>
          </div>
        )}

        {displayCategories.map(cat => {
          const items = filtered.filter(p => p.category === cat)
          if (items.length === 0) return null
          return (
            <div key={cat} className="mt-12">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <h2 className="text-lg font-bold tracking-tight text-[#7B2FBE]">{cat}</h2>
                <div className="flex-1 h-px bg-[#e0d6f5]" />
                <span className="text-xs text-slate-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {items.map(product => {
                  const imgs = PRODUCT_IMAGES[product.slug] || []
                  const inWishlist = wishlist.includes(product.slug)
                  return (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/store/${product.slug}`)}
                      className="group relative flex cursor-pointer flex-col gap-3 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); toggle(product.slug) }}
                        title={inWishlist ? 'Remove from saved' : 'Save for later'}
                        className={`absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm transition ${inWishlist ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-200 bg-white text-slate-500 hover:border-[#7B2FBE] hover:text-[#7B2FBE]'}`}
                      >
                        {inWishlist ? '❤️' : '🤍'}
                      </button>

                      <div className="aspect-[3/4] overflow-hidden rounded-3xl bg-slate-200">
                        {imgs[0] ? (
                          <img
                            src={imgs[0]}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-3xl">🖨️</div>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                      <p className="text-sm font-semibold text-[#7B2FBE]">From ₦{product.price.toLocaleString()}</p>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); navigate(`/store/${product.slug}`) }}
                        className="mt-auto rounded-full bg-[#7B2FBE] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6b23ba]"
                      >
                        Shop Now
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {wishlist.length > 0 && (
          <div className="mt-10 rounded-[28px] border border-[#e0d6f5] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-[#7B2FBE]">❤️ Your Saved Items ({wishlist.length})</h3>
            <div className="flex flex-wrap gap-3">
              {wishlist.map(slug => {
                const p = ALL_PRODUCTS.find(x => x.slug === slug)
                if (!p) return null
                return (
                  <div key={slug} className="flex items-center gap-3 rounded-2xl border border-[#e0d6f5] bg-[#f9f5ff] px-3 py-2">
                    <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#e0d6f5]">
                      {PRODUCT_IMAGES[slug]?.[0] && (
                        <img src={PRODUCT_IMAGES[slug][0]} alt={p.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <span
                      className="cursor-pointer text-sm font-semibold text-slate-800 hover:text-[#7B2FBE]"
                      onClick={() => navigate(`/store/${slug}`)}
                    >
                      {p.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggle(slug)}
                      className="text-lg leading-none text-rose-600"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
