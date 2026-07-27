import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.webp';

export function SettingsView({ token, settings, onDataChanged }) {
  const [form, setForm] = useState({
    phone: '', whatsapp: '', primaryColor: '#7B2FBE', accentColor: '#FF6B00',
    heroTitle: '', heroSubtitle: '', companyName: '', email: '', address: '',
    ga4Id: '', metaPixelId: '',
    paystackPublicKey: '', bankName: '', accountName: '', accountNumber: '',
    ...settings,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setForm(prev => ({ ...prev, ...settings })) }, [settings])

  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })) }

  async function handleSave() {
    setSaving(true); setSaved(false)
    await fetch('/api/admin/settings', {
      method: 'PUT', headers: authH(token), body: JSON.stringify(form),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    onDataChanged()
  }

  return (
    <div>
      <h2 className="text-[20px] font-extrabold text-slate-900 mb-5">Site Settings</h2>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Contact Information</h3>
          <Input label="Company Name" value={form.companyName} onChange={e => set('companyName', e.target.value)} />
          <Input label="Phone Number" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+2348065275264" />
          <Input label="WhatsApp Number (digits only)" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="2348065275264" />
          <Input label="Email Address" value={form.email} onChange={e => set('email', e.target.value)} placeholder="info@sleekbluemediahouz.com" />
          <Input label="Address" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Lagos, Nigeria" />
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Homepage Content</h3>
          <Input label="Hero Title" value={form.heroTitle} onChange={e => set('heroTitle', e.target.value)} placeholder="Premium Print, Branding & Design" />
          <Input label="Hero Subtitle" value={form.heroSubtitle} onChange={e => set('heroSubtitle', e.target.value)} placeholder="Zero Stress. Fast Turnaround." />
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Brand Colours</h3>
          <p className="text-sm text-slate-500 mb-4 leading-6">
            Choose your brand colours. Changes are saved and applied to new content. Contact your developer to apply site-wide.
          </p>
          <div className="flex flex-wrap gap-5">
            <div className="min-w-[220px]">
              <label className="block text-[12px] font-semibold text-slate-600 mb-2">Primary Colour</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.primaryColor} onChange={e => set('primaryColor', e.target.value)}
                  className="h-11 w-12 rounded-[10px] border border-slate-300 p-1 cursor-pointer" />
                <input value={form.primaryColor} onChange={e => set('primaryColor', e.target.value)}
                  className="w-[100px] rounded-2xl border border-slate-300 px-3 py-2 text-sm font-mono" />
                <div className="h-10 w-10 rounded-2xl border border-slate-200" style={{ background: form.primaryColor }} />
              </div>
            </div>
            <div className="min-w-[220px]">
              <label className="block text-[12px] font-semibold text-slate-600 mb-2">Accent Colour</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.accentColor} onChange={e => set('accentColor', e.target.value)}
                  className="h-11 w-12 rounded-[10px] border border-slate-300 p-1 cursor-pointer" />
                <input value={form.accentColor} onChange={e => set('accentColor', e.target.value)}
                  className="w-[100px] rounded-2xl border border-slate-300 px-3 py-2 text-sm font-mono" />
                <div className="h-10 w-10 rounded-2xl border border-slate-200" style={{ background: form.accentColor }} />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-[#7B2FBE] mb-3">Payment Setup</h3>
          <Input label="Paystack Public Key" value={form.paystackPublicKey} onChange={e => set('paystackPublicKey', e.target.value)} placeholder="pk_live_xxx..." />
          <Input label="Bank Name" value={form.bankName} onChange={e => set('bankName', e.target.value)} placeholder="e.g. Access Bank" />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Account Name" value={form.accountName} onChange={e => set('accountName', e.target.value)} placeholder="Sleekblue Media Houz" />
            <Input label="Account Number" value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} placeholder="0123456789" />
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Current Settings Preview</h3>
          <div className="bg-slate-100 rounded-2xl p-4 text-sm text-slate-600 leading-7">
            <div><strong>Phone:</strong> {form.phone || '—'}</div>
            <div><strong>WhatsApp:</strong> {form.whatsapp ? `https://wa.me/${form.whatsapp}` : '—'}</div>
            <div><strong>Email:</strong> {form.email || '—'}</div>
            <div><strong>Bank:</strong> {form.bankName || '—'}</div>
            <div><strong>Account:</strong> {form.accountName || '—'}{form.accountNumber ? ` • ${form.accountNumber}` : ''}</div>
            <div><strong>Paystack:</strong> {form.paystackPublicKey ? 'Enabled' : 'Not configured'}</div>
            <div><strong>Hero:</strong> {form.heroTitle}</div>
            <div><strong>Subtitle:</strong> {form.heroSubtitle}</div>
          </div>
        </Card>
      </div>
      <Card className="mt-4 bg-[#f5f0ff] border border-[#d4b5ff]">
        <h3 className="text-sm font-bold text-[#7B2FBE] mb-2">📊 Analytics Tracking</h3>
        <p className="text-sm text-slate-500 mb-4 leading-6">
          Enter your Google Analytics 4 Measurement ID and/or Meta Pixel ID. Scripts are injected automatically once saved.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Google Analytics 4 ID" value={form.ga4Id} onChange={e => set('ga4Id', e.target.value)} placeholder="G-XXXXXXXXXX" />
          <Input label="Meta Pixel ID" value={form.metaPixelId} onChange={e => set('metaPixelId', e.target.value)} placeholder="1234567890" />
        </div>
        {form.ga4Id && <p className="text-[11px] text-emerald-600 mt-2">✓ GA4 tracking active after save</p>}
        {form.metaPixelId && <p className="text-[11px] text-emerald-600 mt-1">✓ Meta Pixel active after save</p>}
      </Card>

      <Card className="mt-4 bg-[#eff9ff] border border-[#bae6fd]">
        <h3 className="text-sm font-bold text-[#0369a1] mb-2">💾 Data Backup</h3>
        <p className="text-sm text-slate-600 mb-3 leading-6">Download a complete backup of all site data as JSON. Save a copy before making major changes.</p>
        <button onClick={async () => {
          try {
            const res = await fetch('/api/admin/backup', { headers: authH(token) })
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = `sleekblue-backup-${new Date().toISOString().slice(0,10)}.json`; a.click()
            URL.revokeObjectURL(url)
          } catch {}
        }}
          className="rounded-2xl bg-[#0369a1] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#055a8c]">
          ⬇ Download Backup
        </button>
      </Card>
      <SaveBar onSave={handleSave} saving={saving} saved={saved} />
    </div>
  )
}
