import { useState } from 'react'
import { ALL_PRODUCTS } from '../data/products'
import { useSEO } from '../hooks/useSEO'
import { trackQuoteRequest } from '../hooks/useAnalytics'

export default function QuotePage() {
  useSEO('quote', {
    title: 'Request a Quote — Sleekblue Media Houz',
    description: 'Get a fast custom quote for your printing order — die-cut stickers, flex banners, business cards and more. We respond via WhatsApp within minutes.',
  })
  const [form, setForm] = useState({ name: '', phone: '', email: '', product: '', quantity: '', details: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    trackQuoteRequest(form.product, { quantity: form.quantity, details: form.details })
    const msg = encodeURIComponent(
      `📋 *QUOTE REQUEST - Sleekblue Media Houz*\n\n` +
      `Name: ${form.name}\n` +
      `Phone: ${form.phone}\n` +
      `Email: ${form.email || 'N/A'}\n` +
      `Product: ${form.product}\n` +
      `Quantity: ${form.quantity}\n` +
      `Details: ${form.details || 'N/A'}\n\n` +
      `Please send a quote for this order. Thank you!`
    )
    window.open(`https://wa.me/2348065275264?text=${msg}`, '_blank')
    setSubmitted(true)
  }

  return (
    <section className="min-h-screen bg-[#FAF3E8] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Request a Quote</h1>
        <p className="mt-3 text-sm text-slate-600">Fill in the details below and we'll respond via WhatsApp within minutes.</p>

        {submitted ? (
          <div className="mt-10 rounded-[28px] bg-white p-10 text-center shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-emerald-600">Quote Sent!</h2>
            <p className="mt-3 text-sm text-slate-600">We've received your request and will reply on WhatsApp shortly.</p>
          </div>
        ) : (
          <form className="mt-10 space-y-6 rounded-[28px] bg-white p-8 shadow-[0_1px_6px_rgba(0,0,0,0.06)]" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Full Name *</label>
              <input
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/20"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Phone Number *</label>
              <input
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/20"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+234 800 000 0000"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Email Address</label>
              <input
                type="email"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/20"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Product Needed *</label>
              <select
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/20"
                value={form.product}
                onChange={e => setForm({ ...form, product: e.target.value })}
              >
                <option value="">Select a product...</option>
                {ALL_PRODUCTS.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Quantity *</label>
              <input
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/20"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                placeholder="e.g. 500 pcs"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">Additional Details</label>
              <textarea
                className="w-full min-h-[100px] rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/20 resize-vertical"
                value={form.details}
                onChange={e => setForm({ ...form, details: e.target.value })}
                placeholder="Size, design details, deadline, etc."
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#1ebf5a]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Send Quote Request via WhatsApp
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
