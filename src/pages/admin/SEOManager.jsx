import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.jpg';

const SEO_PAGES = [
  { key: 'home',     label: '🏠 Homepage',        path: '/' },
  { key: 'store',    label: '🛍️ Store',            path: '/store' },
  { key: 'about',    label: '📖 About Us',         path: '/about' },
  { key: 'blog',     label: '✍️ Blog',             path: '/blog' },
  { key: 'quote',    label: '📝 Request a Quote',  path: '/quote' },
  { key: 'dieCut',   label: '🏷️ Die-Cut Stickers', path: '/store/die-cut-stickers' },
  { key: 'flexBanner',label: '📢 Flex Banner',     path: '/store/flex-banner' },
  { key: 'labels',   label: '🔖 Product Labels',   path: '/store/product-labels' },
]

export function SeoView({ token }) {
  const [seo, setSeo] = useState({})
  const [activePage, setActivePage] = useState('home')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/seo').then(r => r.ok ? r.json() : {}).then(setSeo).catch(() => {})
  }, [])

  function set(pageKey, field, value) {
    setSeo(prev => ({
      ...prev,
      [pageKey]: { ...(prev[pageKey] || {}), [field]: value }
    }))
  }

  async function save() {
    setSaving(true)
    await fetch('/api/admin/seo', { method: 'PUT', headers: authH(token), body: JSON.stringify(seo) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  const page = SEO_PAGES.find(p => p.key === activePage)
  const entry = seo[activePage] || {}

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[20px] font-extrabold text-slate-900 mb-1">🔍 SEO Manager</h2>
        <p className="text-sm text-slate-500 m-0">Set meta titles and descriptions for each page. These help Google rank your site higher.</p>
      </div>

      {/* Page tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SEO_PAGES.map(p => (
          <button key={p.key} onClick={() => setActivePage(p.key)}
            className={`rounded-2xl px-4 py-2 text-[12px] font-semibold transition shadow-sm ${activePage === p.key ? 'bg-[#7B2FBE] text-white' : 'bg-white text-slate-600'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <Card>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#7B2FBE] mb-1">{page?.label}</h3>
            <p className="text-xs text-slate-500 m-0">URL: {page?.path}</p>
          </div>
        </div>

        <Input label="Meta Title"
          value={entry.title || ''}
          onChange={e => set(activePage, 'title', e.target.value)}
          placeholder="e.g. Sleekblue Media Houz — Premium Printing in Nigeria" />
        <p className={`text-[11px] mb-3 ${entry.title?.length > 60 ? 'text-rose-600' : 'text-slate-400'}`}>
          {(entry.title || '').length}/60 characters {entry.title?.length > 60 ? '⚠️ Too long — Google truncates at 60' : '✓ Good length'}
        </p>

        <Input label="Meta Description" rows={3}
          value={entry.description || ''}
          onChange={e => set(activePage, 'description', e.target.value)}
          placeholder="A brief, compelling description of this page (150–160 characters ideal)" />
        <p className={`text-[11px] mb-3 ${((entry.description?.length || 0) > 160) ? 'text-rose-600' : 'text-slate-400'}`}>
          {(entry.description || '').length}/160 characters {(entry.description?.length || 0) > 160 ? '⚠️ Too long' : (entry.description?.length || 0) > 120 ? '✓ Good' : (entry.description?.length || 0) > 0 ? '⚠️ Too short' : ''}
        </p>

        <Input label="Keywords (comma separated)"
          value={entry.keywords || ''}
          onChange={e => set(activePage, 'keywords', e.target.value)}
          placeholder="die cut stickers Nigeria, flex banner printing Lagos, branded merchandise" />

        {/* Google preview */}
        {(entry.title || entry.description) && (
          <div className="mt-2 rounded-[10px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.08em] mb-2">Google Preview</p>
            <p className="text-[18px] text-[#1a0dab] mb-1 leading-tight font-sans">{entry.title || 'Page Title'}</p>
            <p className="text-sm text-[#006621] mb-1 font-sans">sleekbluemediahouz.com{page?.path}</p>
            <p className="text-sm text-slate-700 leading-[1.55] font-sans">{entry.description || 'Meta description will appear here…'}</p>
          </div>
        )}
      </Card>

      {/* SEO Tips */}
      <Card className="mt-4 bg-[#f9f5ff]">
        <h3 className="text-sm font-bold text-[#7B2FBE] mb-3">💡 SEO Tips for Sleekblue</h3>
        <ul className="m-0 list-disc pl-5 text-sm leading-7 text-slate-700">
          <li>Include keywords like <strong>"die cut stickers Nigeria"</strong>, <strong>"flex banner Lagos"</strong>, <strong>"printing company Nigeria"</strong></li>
          <li>Keep meta titles under <strong>60 characters</strong> and descriptions under <strong>160 characters</strong></li>
          <li>Each page should have a <strong>unique</strong> title and description</li>
          <li>Mention your city/location — <strong>"Lagos printing company"</strong> gets local search traffic</li>
          <li>After saving, use <strong>Google Search Console</strong> to track your rankings</li>
        </ul>
      </Card>

      <SaveBar onSave={save} saving={saving} saved={saved} />
    </div>
  )
}
