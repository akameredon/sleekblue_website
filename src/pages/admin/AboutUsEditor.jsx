import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.jpg';

const ABOUT_DEF = {
  heroTitle: 'About Sleekblue Media Houz', heroSubtitle: 'We print for the biggest brands — and yours is next.',
  whoWeAreTitle: 'Who We Are', whoWeAre: 'Sleekblue Media Houz is a premium printing and corporate branding company dedicated to helping businesses of all sizes communicate their identity with clarity and confidence.',
  missionTitle: 'Our Mission', mission: 'To deliver premium printing with zero stress — high quality output, fast turnaround, and reliable service.',
  valuesTitle: 'What Sets Us Apart',
  values: [
    { icon: '🎯', title: 'Precision', desc: 'Every cut, every print is executed to exact specifications.' },
    { icon: '⚡', title: 'Speed', desc: 'Fast turnaround without compromising on quality.' },
    { icon: '💎', title: 'Quality', desc: 'Waterproof, durable materials that last and impress.' },
    { icon: '🤝', title: 'Trust', desc: 'Trusted by UBA, MTN, HERO, NNPC, Seplat, and 500+ brands.' },
    { icon: '💰', title: 'Value', desc: 'Bulk discounts for growing businesses.' },
    { icon: '🛠️', title: 'Support', desc: '24/7 customer care and WhatsApp-first communication.' },
  ],
  whoWeServeTitle: 'Who We Serve',
  whoWeServe: ['Solopreneurs & Micro Businesses', 'Small Business Owners', 'Growth Business Enterprises', 'Big Brands & Corporate Organizations'],
  ctaTitle: 'Ready to Print?', ctaText: 'Call us or chat on WhatsApp — we respond fast.',
  stats: [{ value: '500+', label: 'Happy Clients' }, { value: '5★', label: 'Google Rating' }, { value: '10+', label: 'Years Experience' }, { value: '24/7', label: 'Support' }],
  showStats: true,
}

export function AboutView({ token }) {
  const [d, setD] = useState(ABOUT_DEF)
  const [tab, setTab] = useState('hero')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/about').then(r => r.ok ? r.json() : null).then(data => {
      if (data) setD({ ...ABOUT_DEF, ...data, values: data.values || ABOUT_DEF.values, whoWeServe: data.whoWeServe || ABOUT_DEF.whoWeServe, stats: data.stats || ABOUT_DEF.stats })
    }).catch(() => {})
  }, [])

  function set(k, v) { setD(p => ({ ...p, [k]: v })) }
  function updateValue(i, f, v) { const a = [...d.values]; a[i] = { ...a[i], [f]: v }; set('values', a) }
  function removeValue(i) { set('values', d.values.filter((_, idx) => idx !== i)) }
  function addValue() { set('values', [...d.values, { icon: '⭐', title: 'New Value', desc: 'Description here.' }]) }
  function updateStat(i, f, v) { const a = [...d.stats]; a[i] = { ...a[i], [f]: v }; set('stats', a) }
  function removeStat(i) { set('stats', d.stats.filter((_, idx) => idx !== i)) }
  function updateServe(i, v) { const a = [...d.whoWeServe]; a[i] = v; set('whoWeServe', a) }
  function removeServe(i) { set('whoWeServe', d.whoWeServe.filter((_, idx) => idx !== i)) }

  async function save() {
    setSaving(true)
    await fetch('/api/admin/about', { method: 'PUT', headers: authH(token), body: JSON.stringify(d) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  const tabs = [
    { id: 'hero', label: '🏠 Hero' },
    { id: 'content', label: '📝 Content' },
    { id: 'values', label: '⭐ Values' },
    { id: 'serve', label: '👥 Who We Serve' },
    { id: 'stats', label: '📊 Stats Bar' },
    { id: 'cta', label: '📞 CTA' },
  ]

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[20px] font-extrabold text-slate-900 mb-1">About Us Page</h2>
        <p className="text-sm text-slate-500">Edit every section of the About Us page. Click 🚀 Publish to go live.</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${tab === t.id ? 'bg-[#7B2FBE] text-white' : 'bg-white text-slate-600 shadow-sm'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'hero' && (
        <Card>
          <h3 className="mb-4 text-sm font-bold text-[#7B2FBE]">Hero Section</h3>
          <Input label="Hero Title" value={d.heroTitle} onChange={e => set('heroTitle', e.target.value)} placeholder="About Sleekblue Media Houz" />
          <Input label="Hero Subtitle" value={d.heroSubtitle} onChange={e => set('heroSubtitle', e.target.value)} rows={2} placeholder="We print for the biggest brands…" />
        </Card>
      )}

      {tab === 'content' && (
        <>
          <Card className="mb-4">
            <h3 className="mb-4 text-sm font-bold text-[#7B2FBE]">Who We Are</h3>
            <Input label="Section Title" value={d.whoWeAreTitle} onChange={e => set('whoWeAreTitle', e.target.value)} />
            <Input label="Content" value={d.whoWeAre} onChange={e => set('whoWeAre', e.target.value)} rows={5} />
          </Card>
          <Card>
            <h3 className="mb-4 text-sm font-bold text-[#7B2FBE]">Our Mission</h3>
            <Input label="Section Title" value={d.missionTitle} onChange={e => set('missionTitle', e.target.value)} />
            <Input label="Content" value={d.mission} onChange={e => set('mission', e.target.value)} rows={4} />
          </Card>
        </>
      )}

      {tab === 'values' && (
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-[#7B2FBE]">Values / What Sets Us Apart</h3>
            <Btn onClick={addValue} className="px-4 py-2 text-sm">+ Add Value</Btn>
          </div>
          <Input label="Section Title" value={d.valuesTitle} onChange={e => set('valuesTitle', e.target.value)} placeholder="What Sets Us Apart" />
          {d.values.map((v, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-[60px_1fr_1fr_36px] mb-2 items-start rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <input value={v.icon} onChange={e => updateValue(i, 'icon', e.target.value)} className="rounded-2xl border border-slate-300 px-2 py-1 text-2xl text-center" />
              <input value={v.title} onChange={e => updateValue(i, 'title', e.target.value)} placeholder="Title" className="rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none" />
              <input value={v.desc} onChange={e => updateValue(i, 'desc', e.target.value)} placeholder="Description" className="rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none" />
              <button onClick={() => removeValue(i)} className="rounded-2xl bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-600">×</button>
            </div>
          ))}
        </Card>
      )}

      {tab === 'serve' && (
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-[#7B2FBE]">Who We Serve</h3>
            <Btn onClick={() => set('whoWeServe', [...d.whoWeServe, ''])} className="px-4 py-2 text-sm">+ Add</Btn>
          </div>
          <Input label="Section Title" value={d.whoWeServeTitle} onChange={e => set('whoWeServeTitle', e.target.value)} />
          {d.whoWeServe.map((s, i) => (
            <div key={i} className="mb-2 flex flex-wrap items-center gap-2">
              <input value={s} onChange={e => updateServe(i, e.target.value)} className="flex-1 rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none" />
              <button onClick={() => removeServe(i)} className="rounded-2xl bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-600">×</button>
            </div>
          ))}
        </Card>
      )}

      {tab === 'stats' && (
        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-[#7B2FBE]">Stats Bar</h3>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={d.showStats} onChange={e => set('showStats', e.target.checked)} /> Show stats bar
              </label>
              <Btn onClick={() => set('stats', [...d.stats, { value: '0', label: 'New Stat' }])} className="px-4 py-2 text-sm">+ Add Stat</Btn>
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-4">Purple stats bar shown just below the hero banner.</p>
          {d.stats.map((s, i) => (
            <div key={i} className="mb-2 flex flex-wrap items-center gap-2">
              <input value={s.value} onChange={e => updateStat(i, 'value', e.target.value)} placeholder="500+" className="w-[100px] rounded-2xl border border-slate-300 px-3 py-2 text-sm font-semibold outline-none" />
              <input value={s.label} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="Happy Clients" className="flex-1 rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none" />
              <button onClick={() => removeStat(i)} className="rounded-2xl bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-600">×</button>
            </div>
          ))}
        </Card>
      )}

      {tab === 'cta' && (
        <Card>
          <h3 className="mb-4 text-sm font-bold text-[#7B2FBE]">Call to Action Section</h3>
          <Input label="CTA Title" value={d.ctaTitle} onChange={e => set('ctaTitle', e.target.value)} placeholder="Ready to Print?" />
          <Input label="CTA Text" value={d.ctaText} onChange={e => set('ctaText', e.target.value)} rows={2} placeholder="Call us or chat on WhatsApp…" />
          <p className="mt-[-8px] text-[11px] text-slate-400">Phone and WhatsApp numbers are pulled from Site Settings → Contact Information.</p>
        </Card>
      )}

      <SaveBar onSave={save} saving={saving} saved={saved} />
    </div>
  )
}
