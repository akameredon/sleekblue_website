import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ALL_PRODUCTS } from '../data/products'
import { PRODUCT_IMAGES } from '../data/productImages'

const POPULAR = ['die-cut-stickers', 'flex-banner', 'flyers-posters', 'business-card', 'rollup-stand', 't-shirts']

export default function NotFoundPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = '404 — Page Not Found | Sleekblue Media Houz'
  }, [])

  const popular = POPULAR
    .map(slug => ALL_PRODUCTS.find(p => p.slug === slug))
    .filter(Boolean)

  return (
    <div className="min-h-[80vh] bg-slate-50 font-sans">
      <div className="bg-gradient-to-br from-[#7B2FBE] to-[#5a1f8a] px-6 py-20 text-center text-white">
        <div className="text-[80px] leading-none select-none md:text-[120px]">404</div>
        <h1 className="mt-4 text-3xl font-black">Oops! This page doesn&apos;t exist</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-white/85">
          The link may have been moved, renamed, or may never have existed. Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="rounded-2xl bg-[#F4A621] px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
          >
            🏠 Go Home
          </button>
          <button
            onClick={() => navigate('/store')}
            className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            🛍️ Browse Store
          </button>
          <button
            onClick={() => navigate('/quote')}
            className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            📝 Request a Quote
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-2xl font-extrabold text-slate-900">Popular Products</h2>
        <p className="mt-2 text-center text-sm text-slate-500">Thousands of happy customers order these every week</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map(product => {
            const imgs = PRODUCT_IMAGES[product.slug] || []
            const img = imgs[0]
            return (
              <Link
                key={product.slug}
                to={`/store/${product.slug}`}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="aspect-[3/2] bg-slate-100 overflow-hidden">
                  {img ? (
                    <img src={img} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">🖨️</div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                  <p className="mt-2 text-xs font-semibold text-[#7B2FBE]">{product.tagline || 'Premium quality printing'}</p>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-14 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-base font-bold text-slate-900">Still need help?</p>
          <p className="mt-2 text-sm text-slate-500">Our team is always ready to assist you with your printing needs.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/2348065275264"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebf5a]"
            >
              💬 WhatsApp Us
            </a>
            <a
              href="mailto:info@sleekbluemediahouz.com"
              className="rounded-2xl bg-[#7B2FBE] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6b23ba]"
            >
              ✉️ Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
