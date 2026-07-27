import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.webp';

export function TrustBarEditor({ token, data, onDataChanged }) {
  const def = { rating: '5.0/5', reviewCount: '500+', tagline: 'TRUSTED BY GLOBAL BRANDS', partners: [
    { key: 'UBA', name: 'UBA', visible: true }, { key: 'MTN', name: 'MTN', visible: true },
    { key: 'HERO', name: 'HERO', visible: true }, { key: 'IMO_DIGITAL', name: 'Imo Digital City Limited', visible: true },
    { key: 'NNPC', name: 'NNPC', visible: true }, { key: 'SEPLAT', name: 'Seplat Energy', visible: true },
  ]}
  const [d, setD] = useState({ ...def, ...(data || {}), partners: (data?.partners || def.partners) })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(null)
  const [newBrandName, setNewBrandName] = useState('')

  function togglePartner(i) { const p = [...d.partners]; p[i] = { ...p[i], visible: !p[i].visible }; setD({ ...d, partners: p }) }
  function updatePartnerName(i, v) { const p = [...d.partners]; p[i] = { ...p[i], name: v }; setD({ ...d, partners: p }) }
  function movePartner(i, dir) { const p = [...d.partners], j = i + dir; if (j < 0 || j >= p.length) return;[p[i], p[j]] = [p[j], p[i]]; setD({ ...d, partners: p }) }
  function removePartner(i) { if (!confirm('Remove this brand logo?')) return; setD({ ...d, partners: d.partners.filter((_, idx) => idx !== i) }) }

  async function uploadLogo(i, file) {
    setUploading(i)
    const fd = new FormData(); fd.append('image', file)
    const res = await fetch('/api/admin/upload/brand-logo', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
    const json = await res.json()
    setUploading(null)
    if (json.url) {
      const p = [...d.partners]; p[i] = { ...p[i], url: json.url }; setD({ ...d, partners: p })
    }
  }

  async function addNewBrand(file) {
    if (!newBrandName.trim()) { alert('Enter a brand name first.'); return }
    setUploading('new')
    const fd = new FormData(); fd.append('image', file)
    const res = await fetch('/api/admin/upload/brand-logo', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
    const json = await res.json()
    setUploading(null)
    if (json.url) {
      const key = 'CUSTOM_' + Date.now()
      setD({ ...d, partners: [...d.partners, { key, name: newBrandName.trim(), url: json.url, visible: true }] })
      setNewBrandName('')
    }
  }

  async function save() {
    setSaving(true)
    await fetch('/api/admin/content', { method: 'PUT', headers: authH(token), body: JSON.stringify({ trustBar: d }) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000); onDataChanged()
  }

  return (
    <div>
      <Card className="mb-4">
        <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Trust Bar Text</h3>
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_2fr]">
          <Input label="Star Rating Text" value={d.rating} onChange={e => setD({ ...d, rating: e.target.value })} placeholder="5.0/5" />
          <Input label="Review Count" value={d.reviewCount} onChange={e => setD({ ...d, reviewCount: e.target.value })} placeholder="500+" />
          <Input label="Tagline (ALL CAPS recommended)" value={d.tagline} onChange={e => setD({ ...d, tagline: e.target.value })} placeholder="TRUSTED BY GLOBAL BRANDS" />
        </div>
      </Card>
      <Card className="mb-4">
        <h3 className="text-sm font-bold text-[#7B2FBE] mb-1">Partner Logos</h3>
        <p className="text-sm text-slate-500 mb-4">Upload your own logo images, toggle visibility, edit names, and reorder. Pre-loaded logos shown by default.</p>
        {d.partners.map((p, i) => (
          <div key={i} className={`flex flex-wrap items-center gap-2 rounded-2xl border p-3 ${p.visible !== false ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-100'}`}>
            {p.url ? (
              <img src={p.url} alt={p.name} className="h-10 w-12 rounded-xl border border-slate-200 object-contain bg-white flex-shrink-0" />
            ) : (
              <div className="flex h-10 w-12 items-center justify-center rounded-xl bg-slate-200 text-[10px] text-slate-500 flex-shrink-0">LOGO</div>
            )}
            <label className="cursor-pointer flex-shrink-0">
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadLogo(i, e.target.files[0])} />
              <span className={`inline-block rounded-xl border px-3 py-2 text-[11px] font-semibold ${uploading === i ? 'bg-slate-400 text-white border-slate-400' : 'bg-[#f0efff] text-[#7B2FBE] border-[#7B2FBE]/30'}`}>
                {uploading === i ? '⏳' : '⬆ Upload'}
              </span>
            </label>
            <button onClick={() => togglePartner(i)} className={`rounded-xl px-3 py-2 text-[12px] font-semibold text-white ${p.visible !== false ? 'bg-emerald-600' : 'bg-slate-400'}`}>{p.visible !== false ? '✓ Visible' : '✗ Hidden'}</button>
            <input value={p.name} onChange={e => updatePartnerName(i, e.target.value)}
              className="min-w-[80px] flex-1 rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none" />
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => movePartner(i, -1)} disabled={i === 0} className="rounded-xl bg-[#f0efff] px-2 text-[11px] font-semibold text-[#7B2FBE]">▲</button>
              <button onClick={() => movePartner(i, 1)} disabled={i === d.partners.length - 1} className="rounded-xl bg-[#f0efff] px-2 text-[11px] font-semibold text-[#7B2FBE]">▼</button>
              <button onClick={() => removePartner(i)} className="rounded-xl bg-rose-100 px-2 text-[12px] font-semibold text-rose-600">×</button>
            </div>
          </div>
        ))}
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-xs font-bold text-slate-600 mb-2">+ Add New Brand Logo</p>
          <div className="flex flex-wrap items-center gap-3">
            <input value={newBrandName} onChange={e => setNewBrandName(e.target.value)} placeholder="Brand name (e.g. Dangote Group)"
              className="min-w-[160px] flex-1 rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none" />
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && addNewBrand(e.target.files[0])} />
              <span className={`inline-block rounded-2xl px-4 py-2 text-sm font-semibold ${uploading === 'new' ? 'bg-slate-400 text-white' : 'bg-[#FF6B00] text-white'}`}>
                {uploading === 'new' ? 'Uploading…' : '⬆ Upload Logo & Add'}
              </span>
            </label>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Enter brand name above, then click to select logo image (PNG, JPG, max 10MB). Click 🚀 Publish to go live.</p>
        </div>
      </Card>
      <SaveBar onSave={save} saving={saving} saved={saved} />
    </div>
  )
}

export function BestSellingEditor({ token, data, onDataChanged }) {
  const [heading, setHeading] = useState(data?.bestSelling_heading || 'BEST SELLING')
  const [subheading, setSubheading] = useState(data?.bestSelling_subheading || 'our most popular and trusted products')
  const [items, setItems] = useState(data?.bestSelling || [])
  const [newSlug, setNewSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggleItem(i) { const a = [...items]; a[i] = { ...a[i], visible: a[i].visible === false ? true : false }; setItems(a) }
  function updateItem(i, f, v) { const a = [...items]; a[i] = { ...a[i], [f]: v }; setItems(a) }
  function removeItem(i) { if (confirm('Remove this item from Best Selling?')) setItems(items.filter((_, idx) => idx !== i)) }
  function moveItem(i, dir) { const a = [...items], j = i + dir; if (j < 0 || j >= a.length) return;[a[i], a[j]] = [a[j], a[i]]; setItems(a) }
  function addItem() {
    const p = ALL_PRODUCTS.find(pr => pr.slug === newSlug.trim() || pr.name.toLowerCase() === newSlug.trim().toLowerCase())
    if (!p) return alert('Product not found. Enter a valid product slug or name.')
    if (items.find(it => it.slug === p.slug)) return alert('Already in list.')
    setItems([...items, { id: p.id, name: p.name, slug: p.slug, price: `From ₦${(p.priceTable?.[0]?.unitPrice * (p.priceTable?.[0]?.qty || 1) || p.price || 0).toLocaleString()}`, unit: 'per piece', visible: true }])
    setNewSlug('')
  }

  async function save() {
    setSaving(true)
    await fetch('/api/admin/content', { method: 'PUT', headers: authH(token), body: JSON.stringify({ bestSelling: items, bestSelling_heading: heading, bestSelling_subheading: subheading }) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000); onDataChanged()
  }

  return (
    <div>
      <Card className="mb-4">
        <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Section Heading</h3>
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <Input label="Heading" value={heading} onChange={e => setHeading(e.target.value)} placeholder="BEST SELLING" />
          <Input label="Sub-heading" value={subheading} onChange={e => setSubheading(e.target.value)} placeholder="our most popular and trusted products" />
        </div>
      </Card>
      <Card className="mb-4">
        <h3 className="text-sm font-bold text-[#7B2FBE] mb-1">Featured Products</h3>
        <p className="text-sm text-slate-500 mb-4">Reorder, toggle visibility, or edit the displayed price text for each product.</p>
        {items.map((item, i) => (
          <div key={i} className={`flex flex-wrap items-center gap-2 rounded-2xl border p-3 ${item.visible !== false ? 'border-[#e0d6f5] bg-white' : 'border-slate-200 bg-slate-100'}`}>
            <button onClick={() => toggleItem(i)} className={`rounded-2xl px-3 py-2 text-xs font-semibold text-white ${item.visible !== false ? 'bg-[#7B2FBE]' : 'bg-slate-400'}`}>
              {item.visible !== false ? '✓ Show' : '✗ Hide'}
            </button>
            <span className="min-w-[100px] flex-1 text-sm font-semibold text-slate-800">{item.name}</span>
            <input value={item.price} onChange={e => updateItem(i, 'price', e.target.value)} placeholder="From ₦22,500"
              className="w-[130px] rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none" />
            <input value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} placeholder="per 500pcs"
              className="w-[110px] rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none" />
            <div className="flex gap-1">
              <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="rounded-xl bg-[#f0efff] px-2 text-[11px] font-semibold text-[#7B2FBE]">▲</button>
              <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} className="rounded-xl bg-[#f0efff] px-2 text-[11px] font-semibold text-[#7B2FBE]">▼</button>
              <button onClick={() => removeItem(i)} className="rounded-xl bg-rose-100 px-2 text-[12px] font-semibold text-rose-600">×</button>
            </div>
          </div>
        ))}
        <div className="mt-3 flex flex-wrap gap-3">
          <input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="Type product slug or name to add…"
            className="flex-1 min-w-[220px] rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none"
            onKeyDown={e => e.key === 'Enter' && addItem()} />
          <Btn variant="ghost" onClick={addItem}>+ Add Product</Btn>
        </div>
      </Card>
      <SaveBar onSave={save} saving={saving} saved={saved} />
    </div>
  )
}

export function TestimonialsEditor({ token, data, onDataChanged }) {
  const [heading, setHeading] = useState(data?.heading || 'Customers love Sleekblue')
  const [rating, setRating] = useState(data?.rating || '5.0/5')
  const [reviewCount, setReviewCount] = useState(data?.reviewCount || '500+')
  const [testimonials, setTestimonials] = useState(data?.testimonials || [])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ name: '', location: '', rating: 5, text: '', visible: true })
  const [adding, setAdding] = useState(false)

  function updateT(i, f, v) { const a = [...testimonials]; a[i] = { ...a[i], [f]: v }; setTestimonials(a) }
  function removeT(i) { if (confirm('Remove this testimonial?')) setTestimonials(testimonials.filter((_, idx) => idx !== i)) }
  function moveT(i, dir) { const a = [...testimonials], j = i + dir; if (j < 0 || j >= a.length) return;[a[i], a[j]] = [a[j], a[i]]; setTestimonials(a) }
  function toggleT(i) { const a = [...testimonials]; a[i] = { ...a[i], visible: a[i].visible !== false ? false : true }; setTestimonials(a) }
  function addT() {
    if (!form.name.trim() || !form.text.trim()) return alert('Name and review text are required.')
    setTestimonials([...testimonials, { ...form }])
    setForm({ name: '', location: '', rating: 5, text: '', visible: true }); setAdding(false)
  }

  async function save() {
    setSaving(true)
    await fetch('/api/admin/content', { method: 'PUT', headers: authH(token), body: JSON.stringify({ reviews: { heading, rating, reviewCount, testimonials } }) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000); onDataChanged()
  }

  return (
    <div>
      <Card className="mb-4">
        <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Section Heading</h3>
        <div className="grid gap-4 md:grid-cols-[3fr_1fr_1fr]">
          <Input label="Section Heading" value={heading} onChange={e => setHeading(e.target.value)} placeholder="Customers love Sleekblue" />
          <Input label="Rating Text" value={rating} onChange={e => setRating(e.target.value)} placeholder="5.0/5" />
          <Input label="Review Count" value={reviewCount} onChange={e => setReviewCount(e.target.value)} placeholder="500+" />
        </div>
      </Card>
      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-bold text-[#7B2FBE]">Testimonials ({testimonials.length})</h3>
          <Btn onClick={() => setAdding(!adding)} variant={adding ? 'ghost' : 'primary'} className="px-4 py-2 text-sm">{adding ? 'Cancel' : '+ Add Testimonial'}</Btn>
        </div>
        {adding && (
          <div className="mb-4 rounded-2xl border border-[#7B2FBE]/20 bg-[#f0efff] p-4">
            <h4 className="mb-3 text-sm font-bold text-[#7B2FBE]">New Testimonial</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Customer Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Emeka Okafor" />
              <Input label="Location (optional)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Lagos, Nigeria" />
            </div>
            <div className="mb-3">
              <label className="mb-2 block text-xs font-semibold text-slate-600">Star Rating</label>
              <div className="flex flex-wrap items-center gap-2">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setForm({ ...form, rating: s })}
                    className={`rounded-2xl px-3 py-2 text-sm font-bold ${s <= form.rating ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-600'}`}>
                    ★
                  </button>
                ))}
                <span className="text-xs text-slate-500">{form.rating} stars</span>
              </div>
            </div>
            <Input label="Review Text *" value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="What did the customer say?" rows={3} />
            <Btn onClick={addT} className="mt-2">+ Add This Testimonial</Btn>
          </div>
        )}
        {testimonials.length === 0 && !adding && (
          <p className="text-center text-sm text-slate-400 p-5">No testimonials yet. Click "+ Add Testimonial" to create your first one.</p>
        )}
        {testimonials.map((t, i) => (
          <div key={i} className={`mb-3 rounded-2xl border p-4 ${t.visible !== false ? 'border-[#e0d6f5] bg-white' : 'border-slate-200 bg-slate-100'}`}>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[220px]">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <input value={t.name} onChange={e => updateT(i, 'name', e.target.value)}
                    className="min-w-[160px] rounded-2xl border border-slate-300 px-3 py-2 text-sm font-semibold outline-none" />
                  <input value={t.location || ''} onChange={e => updateT(i, 'location', e.target.value)} placeholder="Location"
                    className="min-w-[140px] rounded-2xl border border-slate-300 px-3 py-2 text-sm text-slate-500 outline-none" />
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => updateT(i, 'rating', s)}
                        className={`rounded-xl px-2 text-[11px] ${s <= (t.rating||5) ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-500'}`}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={t.text} onChange={e => updateT(i, 'text', e.target.value)} rows={2}
                  className="min-h-[84px] w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none resize-vertical" />
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => toggleT(i)} className={`rounded-2xl px-3 py-2 text-xs font-semibold ${t.visible !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{t.visible !== false ? '✓ Visible' : '✗ Hidden'}</button>
                <button onClick={() => moveT(i, -1)} disabled={i === 0} className="rounded-2xl bg-[#f0efff] px-3 py-2 text-xs font-semibold text-[#7B2FBE]">▲</button>
                <button onClick={() => moveT(i, 1)} disabled={i === testimonials.length - 1} className="rounded-2xl bg-[#f0efff] px-3 py-2 text-xs font-semibold text-[#7B2FBE]">▼</button>
                <button onClick={() => removeT(i)} className="rounded-2xl bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-600">×</button>
              </div>
            </div>
          </div>
        ))}
      </Card>
      <SaveBar onSave={save} saving={saving} saved={saved} />
    </div>
  )
}

export function FooterEditor({ token, data, onDataChanged }) {
  const [tagline, setTagline] = useState(data?.tagline || 'Premium print, branding & design solutions for businesses across Nigeria. Fast turnaround, zero stress.')
  const [services, setServices] = useState(data?.services || ['Die Cut Stickers', 'Flex Banners', 'Business Cards', 'Vehicle Branding', 'Logo & Branding', 'T-Shirts & Caps', 'Rollup Stands', 'Burial Brochures'])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function updateService(i, v) { const s = [...services]; s[i] = v; setServices(s) }
  function removeService(i) { setServices(services.filter((_, idx) => idx !== i)) }
  function moveService(i, dir) { const s = [...services], j = i + dir; if (j < 0 || j >= s.length) return;[s[i], s[j]] = [s[j], s[i]]; setServices(s) }

  async function save() {
    setSaving(true)
    await fetch('/api/admin/content', { method: 'PUT', headers: authH(token), body: JSON.stringify({ footer: { tagline, services } }) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000); onDataChanged()
  }

  return (
    <div>
      <Card className="mb-4">
        <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Footer Tagline</h3>
        <Input label="Tagline Text" value={tagline} onChange={e => setTagline(e.target.value)} rows={3} placeholder="Premium print, branding & design solutions…" />
      </Card>
      <Card className="mb-4">
        <h3 className="text-sm font-bold text-[#7B2FBE] mb-1">Services List</h3>
        <p className="text-sm text-slate-500 mb-4">These appear in the "Services" column in the footer. Reorder or edit as needed.</p>
        {services.map((s, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 mb-2">
            <input value={s} onChange={e => updateService(i, e.target.value)}
              className="flex-1 rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none" />
            <button onClick={() => moveService(i, -1)} disabled={i === 0} className="rounded-xl bg-[#f0efff] px-3 py-2 text-[11px] font-semibold text-[#7B2FBE]">▲</button>
            <button onClick={() => moveService(i, 1)} disabled={i === services.length - 1} className="rounded-xl bg-[#f0efff] px-3 py-2 text-[11px] font-semibold text-[#7B2FBE]">▼</button>
            <button onClick={() => removeService(i)} className="rounded-xl bg-rose-100 px-3 py-2 text-[11px] font-semibold text-rose-600">×</button>
          </div>
        ))}
        <Btn variant="ghost" onClick={() => setServices([...services, ''])} className="mt-2">+ Add Service</Btn>
      </Card>
      <SaveBar onSave={save} saving={saving} saved={saved} />
    </div>
  )
}

export function ContactInfoEditor({ token, settings, onDataChanged }) {
  const [form, setForm] = useState({
    phone: '', whatsapp: '', email: '', address: '', companyName: '',
    ...(settings || {}),
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setForm(prev => ({ ...prev, ...(settings || {}) })) }, [settings])

  async function save() {
    setSaving(true)
    await fetch('/api/admin/settings', { method: 'PUT', headers: authH(token), body: JSON.stringify(form) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000); onDataChanged()
  }

  return (
    <div>
      <Card className="mb-4">
        <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Contact Information</h3>
        <p className="text-sm text-slate-500 mb-4 leading-7">
          These details appear in the footer, WhatsApp links, and contact sections across the entire website. Click 🚀 Publish to push changes live.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Company Name" value={form.companyName || ''} onChange={e => setForm({ ...form, companyName: e.target.value })} placeholder="Sleekblue Media Houz" />
          <Input label="Phone Number (with country code)" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+234 806 527 5264" />
          <Input label="WhatsApp Number (digits only, no +)" value={form.whatsapp || ''} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="2348065275264" />
          <Input label="Email Address" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="info@sleekbluemediahouz.com" />
          <Input label="Address / Location" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Lagos, Nigeria" />
        </div>
        <div className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600 leading-7">
          <strong>Live preview:</strong><br/>
          📞 {form.phone || '(not set)'} &nbsp;|&nbsp; 💬 wa.me/{form.whatsapp || '(not set)'} &nbsp;|&nbsp; 📍 {form.address || '(not set)'}
          {form.email && <> &nbsp;|&nbsp; ✉️ {form.email}</>}
        </div>
      </Card>
      <SaveBar onSave={save} saving={saving} saved={saved} />
    </div>
  )
}

export function ContentView({ token, content, settings, onDataChanged }) {
  const [tab, setTab] = useState('contact')
  const tabs = [
    { id: 'contact', label: '📞 Contact Info' },
    { id: 'trustBar', label: '⭐ Trust Bar' },
    { id: 'bestSelling', label: '🛍️ Best Selling' },
    { id: 'testimonials', label: '💬 Testimonials' },
    { id: 'footer', label: '🔻 Footer' },
  ]
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[20px] font-extrabold text-slate-900 mb-1">Content Management</h2>
        <p className="text-sm text-slate-500">Edit every text section and content block visible on the website. Click 🚀 Publish to push any section live.</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${tab === t.id ? 'bg-[#7B2FBE] text-white' : 'bg-white text-slate-600 shadow-sm'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'contact'     && <ContactInfoEditor  token={token} settings={settings}        onDataChanged={onDataChanged} />}
      {tab === 'trustBar'    && <TrustBarEditor    token={token} data={content.trustBar}   onDataChanged={onDataChanged} />}
      {tab === 'bestSelling' && <BestSellingEditor  token={token} data={content}             onDataChanged={onDataChanged} />}
      {tab === 'testimonials'&& <TestimonialsEditor token={token} data={content.reviews}    onDataChanged={onDataChanged} />}
      {tab === 'footer'      && <FooterEditor       token={token} data={content.footer}     onDataChanged={onDataChanged} />}
    </div>
  )
}
