import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.jpg';

export function PromoBannerView({ token }) {
  const [form, setForm] = useState({ enabled: false, text: '', link: '', color: '#7B2FBE', bgColor: '#f5f0ff' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/promo-banner').then(r => r.ok ? r.json() : null).then(d => { if (d) setForm(d) }).catch(() => {})
  }, [])

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function save() {
    setSaving(true)
    await fetch('/api/admin/promo-banner', { method: 'PUT', headers: authH(token), body: JSON.stringify(form) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[20px] font-extrabold text-slate-900 mb-1">📣 Promo Banner</h2>
        <p className="text-sm text-slate-500 m-0">Shows a coloured announcement bar at the top of every page on your website.</p>
      </div>
      <Card>
        <div className={`mb-5 flex items-center gap-3 rounded-2xl border p-4 ${form.enabled ? 'bg-green-100 border-green-200' : 'bg-[#f9f9f9] border-[#eee]'}`}>
          <label className="flex flex-1 cursor-pointer items-center gap-3">
            <input type="checkbox" checked={form.enabled} onChange={e => set('enabled', e.target.checked)} className="h-4 w-4 cursor-pointer" />
            <span className={`text-sm font-semibold ${form.enabled ? 'text-emerald-600' : 'text-slate-500'}`}>
              {form.enabled ? '✓ Banner is LIVE on your site' : '✗ Banner is hidden'}
            </span>
          </label>
        </div>
        <Input label="Banner Text" value={form.text} onChange={e => set('text', e.target.value)} placeholder="🎉 FREE delivery on orders above ₦50,000 this week only!" />
        <Input label="Link URL (optional)" value={form.link || ''} onChange={e => set('link', e.target.value)} placeholder="/quote or https://wa.me/..." />
        <div className="grid gap-5 mb-4 md:grid-cols-2">
          {[['Text Color', 'color'], ['Background Color', 'bgColor']].map(([label, key]) => (
            <div key={key}>
              <label className="block text-[12px] font-semibold text-slate-600 mb-2">{label}</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form[key]} onChange={e => set(key, e.target.value)} className="h-[42px] w-[50px] rounded-[10px] border border-slate-300 p-1 cursor-pointer" />
                <input value={form[key]} onChange={e => set(key, e.target.value)} className="w-[100px] rounded-2xl border border-slate-300 px-3 py-2 text-sm font-mono" />
                <div className="h-10 w-10 rounded-2xl border border-slate-200" style={{ background: form[key] }} />
              </div>
            </div>
          ))}
        </div>
        {form.text && (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 mb-2">Preview</p>
            <div className="mb-2 rounded-2xl border p-4 text-center" style={{ background: form.bgColor, borderColor: form.color + '20' }}>
              <p className="m-0 text-[13.5px] font-semibold" style={{ color: form.color }}>
                {form.text}
                {form.link && <span className="ml-3 underline">Learn more →</span>}
              </p>
            </div>
          </>
        )}
      </Card>
      <SaveBar onSave={save} saving={saving} saved={saved} />
    </div>
  )
}
