/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, no-unused-vars, no-empty, no-dupe-keys, no-use-before-define */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { ALL_PRODUCTS, getProductDetails, calcStickerPrice, getStickerPriceTable, STICKER_SIZE_PRICES } from '../data/products'
import { PRODUCT_IMAGES, STICKER_SIZE_IMAGES } from '../data/productImages'
import { useSEO } from '../hooks/useSEO'
import { trackProductView } from '../hooks/useAnalytics'
import Breadcrumb from '../components/Breadcrumb'

const thumbColors = ['#C8C8C8', '#B0B0B0', '#D0D0D0']

function fmt(n) {
  return '₦' + Math.round(n).toLocaleString()
}

function getYoutubeId(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/)
  return m ? m[1] : ''
}

// Return the nearest standard sticker size for a given area (w × h)
function findNearestSize(w, h) {
  const area = w * h
  let nearest = '3x3"'
  let minDiff = Infinity
  Object.keys(STICKER_SIZE_PRICES).forEach(sizeKey => {
    const nums = sizeKey.match(/[\d.]+/g)
    if (nums && nums.length >= 2) {
      const a = parseFloat(nums[0]) * parseFloat(nums[1])
      const diff = Math.abs(a - area)
      if (diff < minDiff) { minDiff = diff; nearest = sizeKey }
    }
  })
  return nearest
}

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const baseProduct = ALL_PRODUCTS.find(p => p.slug === slug) || ALL_PRODUCTS[7]

  // Dynamic SEO per product page
  const seoKey = slug === 'die-cut-stickers' ? 'dieCut' : slug === 'flex-banner' ? 'flexBanner' : slug === 'product-labels' ? 'labels' : slug
  useSEO(seoKey, { title: `${baseProduct?.name || 'Product'} — Sleekblue Media Houz`, description: `Order ${baseProduct?.name || 'custom printing'} from Sleekblue Media Houz. Premium quality, fast delivery across Nigeria.` })
  const baseDetails = getProductDetails(baseProduct.slug)

  useEffect(() => {
    const existing = document.getElementById('product-schema')
    if (existing) existing.remove()
    const pricingText = baseDetails?.pricing?.startingAt
      ? String(baseDetails.pricing.startingAt).replace(/[^0-9.]/g, '')
      : null
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: baseProduct?.name || 'Custom Printing',
      description: `Order ${baseProduct?.name || 'custom printing'} from Sleekblue Media Houz. Premium quality, fast delivery across Nigeria. ${baseProduct?.tagline || ''}`.trim(),
      brand: { '@type': 'Brand', name: 'Sleekblue Media Houz' },
      url: `https://sleekbluemediahouz.com/store/${slug}`,
      image: `https://sleekbluemediahouz.com/store/${slug}`,
      offers: {
        '@type': baseProduct?.isDieCut ? 'AggregateOffer' : 'Offer',
        ...(baseProduct?.isDieCut
          ? { lowPrice: '3000', highPrice: '80000', offerCount: Object.keys(STICKER_SIZE_PRICES).length }
          : { price: pricingText || '5000' }
        ),
        priceCurrency: 'NGN',
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'Sleekblue Media Houz' },
      },
    }
    const tag = document.createElement('script')
    tag.id = 'product-schema'
    tag.type = 'application/ld+json'
    tag.textContent = JSON.stringify(schema)
    document.head.appendChild(tag)
    const bcTag = document.createElement('script')
    bcTag.id = 'product-bc-schema'; bcTag.type = 'application/ld+json'
    bcTag.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sleekbluemediahouz.com/' },
        { '@type': 'ListItem', position: 2, name: 'Store', item: 'https://sleekbluemediahouz.com/store' },
        { '@type': 'ListItem', position: 3, name: baseProduct?.name || 'Product', item: `https://sleekbluemediahouz.com/store/${slug}` },
      ],
    })
    document.head.appendChild(bcTag)
    return () => {
      const el = document.getElementById('product-schema'); if (el) el.remove()
      const bc = document.getElementById('product-bc-schema'); if (bc) bc.remove()
    }
  }, [slug, baseProduct, baseDetails])

  // Admin overrides — fetched from server, applied on top of static data
  const [adminOverride, setAdminOverride] = useState(null)
  const [uploadedImages, setUploadedImages] = useState({})
  const [stickerImages, setStickerImages] = useState({})
  const [variantImages, setVariantImages] = useState({})
  useEffect(() => {
    trackProductView(baseProduct.slug, baseProduct.name)
    fetch(`/api/products/${baseProduct.slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setAdminOverride(data) })
      .catch(() => {})
    fetch('/api/product-images')
      .then(r => r.ok ? r.json() : {})
      .then(d => setUploadedImages(d || {}))
      .catch(() => {})
    fetch('/api/sticker-images')
      .then(r => r.ok ? r.json() : {})
      .then(d => setStickerImages(d || {}))
      .catch(() => {})
    fetch('/api/product-variant-images')
      .then(r => r.ok ? r.json() : {})
      .then(d => setVariantImages(d || {}))
      .catch(() => {})
    fetch(`/api/product/views/${baseProduct.slug}`)
      .then(r => r.ok ? r.json() : { views7d: 0 })
      .then(d => setViews7d(d.views7d || 0))
      .catch(() => {})
    try { setInWishlist((JSON.parse(localStorage.getItem('sbm_wishlist') || '[]')).includes(baseProduct.slug)) } catch {}
  }, [baseProduct.slug])

  const product = adminOverride ? { ...baseProduct, ...adminOverride } : baseProduct
  const details = adminOverride
    ? { ...baseDetails, ...(adminOverride.description ? { description: adminOverride.description } : {}), ...(adminOverride.features ? { features: adminOverride.features } : {}), ...(adminOverride.badge ? { badge: adminOverride.badge } : {}) }
    : baseDetails
  const isDieCut = !!baseProduct.isDieCut

  const sizes = product.sizes || ['Standard']
  const [selectedSize, setSelectedSize] = useState(sizes[0])
  const [customQty, setCustomQty] = useState(isDieCut ? 100 : (product.priceTable[0]?.qty || 1))
  const [selectedThumb, setSelectedThumb] = useState(0)
  const [added, setAdded] = useState(false)
  const [artworkFile, setArtworkFile] = useState(null)
  const [artworkUploading, setArtworkUploading] = useState(false)
  const [artworkDone, setArtworkDone] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [views7d, setViews7d] = useState(0)
  const [inWishlist, setInWishlist] = useState(false)

  function toggleWishlist(e) {
    e?.stopPropagation()
    try {
      const list = JSON.parse(localStorage.getItem('sbm_wishlist') || '[]')
      const next = list.includes(slug) ? list.filter(s => s !== slug) : [...list, slug]
      localStorage.setItem('sbm_wishlist', JSON.stringify(next))
      setInWishlist(next.includes(slug))
    } catch {}
  }

  // Custom size state (only for die-cut stickers)
  const [customWidth, setCustomWidth] = useState(3)
  const [customHeight, setCustomHeight] = useState(3)

  // Reset thumbnail when navigating between products
  useEffect(() => {
    setSelectedThumb(0)
    setSelectedSize(sizes[0])
    setCustomQty(isDieCut ? 100 : (product.priceTable[0]?.qty || 1))
    setAdminOverride(null)
  }, [slug])

  // Track recently viewed & load others
  useEffect(() => {
    try {
      const KEY = 'sbm_recently_viewed'
      const existing = JSON.parse(localStorage.getItem(KEY) || '[]')
      setRecentlyViewed(existing.filter(p => p.slug !== slug).slice(0, 6))
      const entry = { slug: product.slug, name: product.name, img: PRODUCT_IMAGES[product.slug]?.[0] || null }
      localStorage.setItem(KEY, JSON.stringify([entry, ...existing.filter(p => p.slug !== slug)].slice(0, 10)))
    } catch {}
  }, [slug])

  async function uploadArtwork() {
    if (!artworkFile) return
    setArtworkUploading(true)
    try {
      const fd = new FormData(); fd.append('artwork', artworkFile)
      const res = await fetch('/api/upload/artwork', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.ok) { setArtworkDone(true); setTimeout(() => { setArtworkDone(false); setArtworkFile(null) }, 4000) }
    } catch {}
    setArtworkUploading(false)
  }

  // For die-cut with Custom size, resolve to nearest standard for pricing
  const effectiveSize = (isDieCut && selectedSize === 'Custom')
    ? findNearestSize(customWidth, customHeight)
    : selectedSize

  // Product images — variant-specific > product-level uploaded > static fallback
  const uploadedForSlug = uploadedImages[product.slug] || []
  const serverStickerImgs = stickerImages[effectiveSize] || []
  const variantSpecificImgs = !isDieCut ? (variantImages[product.slug]?.[selectedSize] || []) : []
  const productImgs = isDieCut
    ? (serverStickerImgs.length > 0 ? serverStickerImgs : (STICKER_SIZE_IMAGES[effectiveSize] || []))
    : (variantSpecificImgs.length > 0 ? variantSpecificImgs : (uploadedForSlug.length > 0 ? uploadedForSlug : (PRODUCT_IMAGES[product.slug] || [])))
  const hasImages = productImgs.length > 0
  const displayImgs = hasImages ? productImgs : null

  // --- Pricing logic (variant-aware) ---
  const variantPriceTable = (!isDieCut && adminOverride?.variantPrices?.[selectedSize] && adminOverride.variantPrices[selectedSize].length > 0)
    ? adminOverride.variantPrices[selectedSize]
    : null

  function getPrice(qty) {
    if (isDieCut) return calcStickerPrice(effectiveSize, qty).total
    const table = variantPriceTable || product.priceTable || []
    if (table.length === 0) return product.price * qty
    let unit = table[0].unitPrice
    for (const row of table) { if (qty >= row.qty) unit = row.unitPrice }
    return unit * qty
  }

  const currentTotal = getPrice(customQty)
  const currentUnit = customQty > 0 ? currentTotal / customQty : 0

  // Die-cut: discount info
  const stickerCalc = isDieCut ? calcStickerPrice(effectiveSize, customQty) : null
  const discountPct = stickerCalc ? Math.round(stickerCalc.discountRate * 100) : 0

  // Price table rows for display
  const activePriceTable = variantPriceTable || product.priceTable || []
  const priceRows = isDieCut
    ? getStickerPriceTable(effectiveSize)
    : activePriceTable.map(row => ({ qty: row.qty, label: row.qty.toLocaleString(), total: row.unitPrice * row.qty, unitPrice: row.unitPrice, discountRate: 0 }))

  function handleAddToCart() {
    addToCart({
      id: product.id,
      name: product.name,
      size: selectedSize === 'Custom' ? `${customWidth}×${customHeight}"` : selectedSize,
      quantity: customQty,
      price: Math.round(currentTotal / customQty),
      slug: product.slug,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2200)
  }

  function handleCheckout() {
    handleAddToCart()
    navigate('/cart')
  }

  function clickQtyRow(qty) {
    setCustomQty(qty)
  }

  const STICKER_SLUGS = ['die-cut-stickers','product-labels','transparent-stickers','holographic-stickers','chrome-stickers','vinyl-roll-labels','seal-stickers','bumper-stickers','barcode-labels','paper-stickers']
  const isSticker = product.category === 'Label Stickers' || STICKER_SLUGS.includes(product.slug)
  const similarProducts = isSticker
    ? ALL_PRODUCTS.filter(p => STICKER_SLUGS.includes(p.slug) && p.id !== product.id).slice(0, 8)
    : ALL_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 8)

  // Popular badge logic for die-cut sizes
  function getSizeBadge(size) {
    if (!isDieCut) return null
    if (size === '3x3"') return { label: '🔥 #1 Popular', bg: '#FF6B00', color: '#fff' }
    if (size === '3x4"') return { label: 'Popular', bg: '#7B2FBE', color: '#fff' }
    return null
  }

  return (
    <section className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px] space-y-6">

        <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Store', href: '/store' }, { label: product.name }]} />

        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)_300px]">

          {/* LEFT — image gallery */}
          <div className="space-y-3">
            <div
              className={`relative flex flex-col items-center overflow-hidden rounded-[1rem] border-4 border-violet-700 ${displayImgs ? 'justify-start pb-0 bg-transparent' : 'justify-end pb-4'} aspect-[3/4]`}
              style={{ background: displayImgs ? 'transparent' : thumbColors[selectedThumb] }}
            >
              {details.badge && (
                <div className="absolute left-3 top-3 rounded-full bg-violet-700 px-3 py-1 text-[11px] font-bold text-white">
                  {details.badge}
                </div>
              )}

              {displayImgs ? (
                <img
                  key={selectedThumb}
                  src={displayImgs[Math.min(selectedThumb, displayImgs.length - 1)]}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover rounded-[0.55rem]"
                />
              ) : (
                <div className="flex h-full w-full items-end justify-center px-3 pb-3 text-center">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{product.name}</p>
                    <p className="text-sm font-bold text-violet-700">{fmt(currentTotal)}</p>
                    <p className="text-xs text-slate-600">for {customQty.toLocaleString()} pcs</p>
                  </div>
                </div>
              )}
            </div>

            {displayImgs ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {displayImgs.map((img, i) => {
                  const sizeClass = displayImgs.length > 4 ? 'h-11 w-11' : displayImgs.length > 3 ? 'h-14 w-14' : 'h-16 w-16'
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedThumb(i)}
                      className={`${sizeClass} overflow-hidden rounded-xl ${selectedThumb === i ? 'ring-2 ring-violet-600' : 'border border-slate-300'} bg-slate-200`}>
                      <img src={img} alt={`View ${i + 1}`} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex gap-2">
                {thumbColors.map((color, i) => (
                  <button key={i} type="button" onClick={() => setSelectedThumb(i)} className={`flex-1 aspect-square rounded-xl border ${selectedThumb === i ? 'border-violet-600' : 'border-slate-300'}`} style={{ background: color }} />
                ))}
              </div>
            )}

            {adminOverride?.videoUrl && (
              <div className="overflow-hidden rounded-[1rem] mt-3">
                {adminOverride.videoUrl.includes('youtube') || adminOverride.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeId(adminOverride.videoUrl)}`}
                    title="Product video"
                    className="h-full w-full min-h-[220px]"
                    allowFullScreen
                  />
                ) : (
                  <video src={adminOverride.videoUrl} controls className="w-full rounded-[1rem]" />
                )}
              </div>
            )}
          </div>

          {/* CENTER — details & pricing */}
          <div className="rounded-[1rem] bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-xl font-black text-slate-900">{product.name}</h1>
              <button
                onClick={toggleWishlist}
                title={inWishlist ? 'Remove from wishlist' : 'Save for later'}
                className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold ${inWishlist ? 'border border-rose-200 bg-rose-50 text-rose-600' : 'border border-violet-200 bg-violet-50 text-violet-700'}`}>
                {inWishlist ? '❤️ Saved' : '🤍 Save'}
              </button>
            </div>
            <p className={`text-sm ${views7d >= 3 ? 'mb-2' : 'mb-4'} text-slate-500`}>{product.category}</p>
            {views7d >= 3 && (
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-rose-600">
                🔥 {views7d} people viewed this in the past 7 days
              </div>
            )}

            <p className="mb-3 text-sm font-semibold text-slate-800">
              {isDieCut ? 'Size (inches):' : 'Size / Type:'}
            </p>
            <div className="mb-5 flex flex-wrap gap-2">
              {sizes.map(size => {
                const badge = getSizeBadge(size)
                const isSelected = selectedSize === size
                const buttonClass = isSelected
                  ? 'bg-violet-700 text-white shadow-sm'
                  : badge
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-900'
                return (
                  <div key={size} className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSize(size)
                        setSelectedThumb(0)
                        setCustomQty(isDieCut ? 100 : (product.priceTable[0]?.qty || 1))
                      }}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${buttonClass}`}
                    >
                      {size}
                    </button>
                    {badge && (
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold text-white ${isSelected ? 'bg-violet-700' : ''}`} style={{ backgroundColor: isSelected ? '#7B2FBE' : badge.bg }}>
                        {badge.label}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {isDieCut && selectedSize === 'Custom' && (
              <div className="mb-5 rounded-[1rem] border border-violet-200 bg-violet-50 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-800">Enter your custom size (inches):</p>
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] text-slate-600">Width (in)</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={customWidth}
                      onChange={e => setCustomWidth(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                      className="w-20 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                    />
                  </div>
                  <span className="text-lg text-slate-600">×</span>
                  <div>
                    <label className="mb-1 block text-[11px] text-slate-600">Height (in)</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={customHeight}
                      onChange={e => setCustomHeight(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                      className="w-20 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                    />
                  </div>
                  <div className="text-sm text-slate-600">
                    → Priced as <strong className="text-violet-700">{effectiveSize}</strong>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500 leading-6">
                  Price estimate based on nearest standard size. Our team will confirm exact pricing.
                </p>
              </div>
            )}

            <div className="mb-5 space-y-3">
              <p className="text-sm font-semibold text-slate-800">
                Price Table{isDieCut && selectedSize === 'Custom' && <span className="text-xs font-normal text-violet-700"> (for {effectiveSize})</span>}
                <span className="ml-2 text-xs font-normal text-slate-500">(click a row to set quantity)</span>
              </p>
              <div className="overflow-hidden rounded-[1rem] border border-slate-200 bg-white shadow-sm">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Qty (pcs)</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Total Price</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Unit Price</th>
                      {isDieCut && <th className="px-4 py-3 text-left font-semibold text-slate-600">Discount</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {priceRows.map((row, i) => {
                      const isActive = customQty === row.qty
                      return (
                        <tr
                          key={i}
                          onClick={() => clickQtyRow(row.qty)}
                          className={`cursor-pointer border-t border-slate-200 transition ${isActive ? 'bg-violet-50' : 'hover:bg-slate-50'}`}
                        >
                          <td className={`px-4 py-3 text-slate-900 ${isActive ? 'font-bold' : 'font-medium'}`}>{row.label || row.qty.toLocaleString()}</td>
                          <td className={`px-4 py-3 ${isActive ? 'font-bold text-violet-700' : 'text-slate-900'}`}>{fmt(row.total)}</td>
                          <td className="px-4 py-3 text-slate-600">{fmt(row.unitPrice)}/pc</td>
                          {isDieCut && (
                            <td className="px-4 py-3">
                              {row.discountRate > 0 ? (
                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-700">
                                  {Math.round(row.discountRate * 100)}% OFF
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500">—</span>
                              )}
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-[1rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="whitespace-nowrap text-sm font-semibold text-slate-800">Custom Qty:</span>
                <button
                  type="button"
                  onClick={() => setCustomQty(q => Math.max(1, q - 1))}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-violet-700 bg-white text-2xl font-bold text-violet-700"
                >
                  −
                </button>
                <input
                  type="number"
                  value={customQty}
                  min={1}
                  onChange={e => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-center text-sm text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCustomQty(q => q + 1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-violet-700 text-2xl font-bold text-white"
                >
                  +
                </button>
                <div className="ml-auto min-w-[120px] text-right">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="text-lg font-bold text-violet-700">{fmt(currentTotal)}</p>
                  {isDieCut && discountPct > 0 && (
                    <p className="mt-1 text-xs font-semibold text-emerald-700">{discountPct}% bulk discount applied!</p>
                  )}
                </div>
              </div>
              {isDieCut && (
                <p className="mt-3 text-xs text-slate-500">
                  Note: Design fee ₦3,000 (first order) · Bulk discounts apply from 500 pcs
                </p>
              )}
            </div>
          </div>

          {/* RIGHT — description */}
          <div className="rounded-[1rem] bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-violet-700">Product Description</h3>
            <p className="mb-4 text-sm leading-7 text-slate-600">{details.description}</p>

            <p className="mb-3 text-sm font-semibold text-slate-900">Features:</p>
            <ul className="mb-5 space-y-2">
              {details.features.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700">
                  <span className="mt-[2px] text-violet-700">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {isDieCut && (
              <div className="mb-5 rounded-2xl bg-amber-100 p-4 text-sm text-amber-900">
                <strong>Bulk Discount:</strong>
                <p className="mt-2 leading-6">
                  500 pcs = 10% off · 1,000 pcs = 20% off<br />
                  2,000 pcs = 22.5% off · 3,000+ pcs = 25% off (max)
                </p>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              className={`mb-3 w-full rounded-[1rem] px-4 py-3 text-sm font-bold text-white transition ${added ? 'bg-emerald-600' : 'bg-orange-500 hover:bg-orange-600'}`}
            >
              {added ? '✓ Added to Cart!' : 'Add to Cart'}
            </button>
            <button
              onClick={handleCheckout}
              className="mb-3 w-full rounded-[1rem] bg-violet-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-800"
            >
              Checkout Now
            </button>
            <a
              href="https://wa.me/2348065275264"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" className="h-4 w-4" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Ask via WhatsApp
            </a>

            <div className="rounded-[1rem] border border-violet-200 bg-violet-50 p-4">
              <p className="mb-2 text-sm font-semibold text-violet-700">📎 Upload Your Artwork (Optional)</p>
              <p className="mb-4 text-xs leading-6 text-slate-500">PDF, PNG, AI, PSD, EPS — max 25MB. We'll review before printing.</p>
              {artworkDone ? (
                <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-center text-sm font-bold text-emerald-800">
                  ✓ Artwork received! Our team will review it.
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <label className="flex-1 min-w-0 cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.ai,.psd,.eps,.svg,.zip"
                      className="hidden"
                      onChange={e => { setArtworkFile(e.target.files[0] || null); setArtworkDone(false) }}
                    />
                    <div className={`overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm ${artworkFile ? 'text-violet-700' : 'text-slate-500'} whitespace-nowrap text-ellipsis overflow-hidden`}>
                      {artworkFile ? `📄 ${artworkFile.name}` : '⬆ Choose artwork file'}
                    </div>
                  </label>
                  {artworkFile && (
                    <button
                      onClick={uploadArtwork}
                      disabled={artworkUploading}
                      className="rounded-2xl bg-violet-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {artworkUploading ? '⏳ Uploading…' : 'Send File'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {similarProducts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-center text-xl font-black text-slate-900 tracking-[0.02em]">SIMILAR ITEMS</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {similarProducts.map((item, i) => {
                const simImgs = PRODUCT_IMAGES[item.slug] || []
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => navigate(`/store/${item.slug}`)}
                    className="group flex flex-col overflow-hidden rounded-[1rem] border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="mb-3 overflow-hidden rounded-2xl bg-slate-200 aspect-[3/4]">
                      {simImgs[0] ? (
                        <img src={simImgs[0]} alt={item.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl">🖨️</div>
                      )}
                    </div>
                    <p className="mb-3 text-xs font-semibold text-slate-900 text-center">{item.name}</p>
                    <span className="inline-flex w-full items-center justify-center rounded-full bg-violet-700 px-3 py-2 text-[11px] font-bold text-white transition group-hover:bg-violet-800">
                      Shop
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {recentlyViewed.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-center text-lg font-black text-slate-900 tracking-[0.02em]">RECENTLY VIEWED</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recentlyViewed.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => navigate(`/store/${item.slug}`)}
                  className="group flex flex-col overflow-hidden rounded-[1rem] border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-3 overflow-hidden rounded-2xl bg-slate-200 aspect-[3/4]">
                    {item.img ? (
                      <img src={item.img} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl">🛍️</div>
                    )}
                  </div>
                  <p className="mb-3 text-xs font-semibold text-slate-900 text-center">{item.name}</p>
                  <span className="inline-flex w-full items-center justify-center rounded-full bg-violet-700 px-3 py-2 text-[11px] font-bold text-white transition group-hover:bg-violet-800">
                    View
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
