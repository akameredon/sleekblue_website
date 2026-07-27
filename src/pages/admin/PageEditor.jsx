import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.jpg';

export function PageEditorView({ token }) {
  const DEFAULT_LAYOUT = [
    { id: 'hero',        label: 'Hero Banner',       icon: '🖼️',  visible: true, description: 'The main slideshow at the top of the homepage' },
    { id: 'trustBar',    label: 'Trust Bar',          icon: '⭐',  visible: true, description: 'Star rating and partner logos strip' },
    { id: 'bestSelling', label: 'Best Selling',       icon: '🛍️', visible: true, description: 'Product grid showcasing your best sellers' },
    { id: 'reviews',     label: 'Customer Reviews',   icon: '💬', visible: true, description: 'Testimonials and ratings from customers' },
  ]
  const [layout, setLayout] = useState(DEFAULT_LAYOUT)
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [heroData, setHeroData] = useState({ headline: '', subheadline: '', btn1: '', btn2: '' })
  const [heroSaving, setHeroSaving] = useState(false)
  const [heroSaved, setHeroSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('layout')

  useEffect(() => {
    fetch('/api/page-layout')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d) && d.length) setLayout(d.map(s => ({ ...DEFAULT_LAYOUT.find(x => x.id === s.id), ...s }))) })
      .catch(() => {})
    fetch('/api/hero')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setHeroData({ headline: d.headline || '', subheadline: d.subheadline || '', btn1: d.btn1 || '', btn2: d.btn2 || '' }) })
      .catch(() => {})
  }, [])

  function toggleVisible(id) {
    setLayout(l => l.map(s => s.id === id ? { ...s, visible: !s.visible } : s))
  }

  function onDragStart(e, idx) {
    setDragging(idx)
    e.dataTransfer.effectAllowed = 'move'
  }
  function onDragOver(e, idx) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(idx)
  }
  function onDrop(e, idx) {
    e.preventDefault()
    if (dragging === null || dragging === idx) { setDragging(null); setDragOver(null); return }
    const next = [...layout]
    const [moved] = next.splice(dragging, 1)
    next.splice(idx, 0, moved)
    setLayout(next)
    setDragging(null)
    setDragOver(null)
  }
  function onDragEnd() { setDragging(null); setDragOver(null) }

  function moveSection(idx, dir) {
    const next = [...layout]
    const j = idx + dir
    if (j < 0 || j >= next.length) return
    ;[next[idx], next[j]] = [next[j], next[idx]]
    setLayout(next)
  }

  async function saveLayout() {
    setSaving(true); setSaved(false)
    await fetch('/api/admin/page-layout', {
      method: 'PUT', headers: authH(token),
      body: JSON.stringify(layout.map(({ id, visible }) => ({ id, visible }))),
    })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  async function saveHero() {
    setHeroSaving(true); setHeroSaved(false)
    await fetch('/api/admin/hero', { method: 'PUT', headers: authH(token), body: JSON.stringify(heroData) })
    setHeroSaving(false); setHeroSaved(true); setTimeout(() => setHeroSaved(false), 3000)
  }

  const tabs = [
    { id: 'layout', label: '⠿ Section Order & Visibility' },
    { id: 'hero',   label: '🖼️ Hero Banner Text' },
  ]

  return (
    <div>
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 mb-1">Page Editor</h2>
          <p className="text-sm text-slate-500 mb-4">Drag and drop sections to reorder the homepage, or toggle them on/off.</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${activeTab === t.id ? 'bg-[#7B2FBE] text-white shadow-[#7B2FBE]/20' : 'bg-white text-slate-600 shadow-sm hover:bg-slate-100'}`}>
                {t.label}
              </button>
            ))}
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              View Live Site ↗
            </a>
          </div>
        </div>

      {activeTab === 'layout' && (
        <div>
          <Card className="mb-4 p-4">
            <p className="text-sm text-slate-500 m-0">
              💡 <strong>Drag</strong> the cards below to reorder homepage sections. <strong>Toggle</strong> the switch to show or hide each section. Click <strong>Save Layout</strong> when done.
            </p>
          </Card>
          <div className="space-y-3 mb-5">
            {layout.map((section, idx) => {
              const isDraggingThis = dragging === idx
              const isOver = dragOver === idx
              return (
                <div key={section.id}
                  draggable
                  onDragStart={e => onDragStart(e, idx)}
                  onDragOver={e => onDragOver(e, idx)}
                  onDrop={e => onDrop(e, idx)}
                  onDragEnd={onDragEnd}
                  className={`rounded-2xl border p-4 flex items-center gap-4 cursor-grab transition ${isDraggingThis ? 'bg-[#eef2ff] border-[#7B2FBE88] opacity-50 shadow-sm' : isOver ? 'bg-[#eef2ff] border-[#7B2FBE] shadow-sm' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <span className="text-2xl text-slate-400 flex-shrink-0">⠿</span>
                  <div className="w-10 h-10 rounded-xl bg-[#f0e8ff] flex items-center justify-center text-2xl flex-shrink-0">{section.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-sm font-semibold text-slate-900">{section.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{section.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => moveSection(idx, -1)} disabled={idx === 0}
                      className="rounded-xl bg-[#f0efff] px-3 py-2 text-[13px] font-semibold text-[#7B2FBE] disabled:cursor-not-allowed disabled:opacity-40">▲</button>
                    <button onClick={() => moveSection(idx, 1)} disabled={idx === layout.length - 1}
                      className="rounded-xl bg-[#f0efff] px-3 py-2 text-[13px] font-semibold text-[#7B2FBE] disabled:cursor-not-allowed disabled:opacity-40">▼</button>
                    <div onClick={() => toggleVisible(section.id)} className="relative w-11 h-6 cursor-pointer flex-shrink-0">
                      <div className={`absolute inset-0 rounded-full transition ${section.visible ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                      <div className={`absolute top-1 ${section.visible ? 'left-5' : 'left-1'} h-4 w-4 rounded-full bg-white shadow-sm transition-all`} />
                    </div>
                    <span className={`text-[11px] font-semibold ${section.visible ? 'text-emerald-600' : 'text-slate-400'} w-11`}>{section.visible ? 'Visible' : 'Hidden'}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Btn onClick={saveLayout} disabled={saving}>{saving ? 'Saving…' : '💾 Save Layout'}</Btn>
            {saved && <span className="text-sm font-semibold text-emerald-700">✓ Layout saved! Refresh the site to see changes.</span>}
          </div>
        </div>
      )}

      {activeTab === 'hero' && (
        <Card>
          <h3 className="text-sm font-bold text-[#7B2FBE] mb-2">Hero Banner Text Overlay</h3>
          <p className="text-sm text-slate-500 mb-4">
            These texts will appear overlaid on the hero slideshow. Leave blank to use the default image-baked text.
          </p>
          <Input label="Main Headline" value={heroData.headline} onChange={e => setHeroData(d => ({ ...d, headline: e.target.value }))} placeholder="e.g. Premium Print. Zero Stress." />
          <Input label="Sub-headline" value={heroData.subheadline} onChange={e => setHeroData(d => ({ ...d, subheadline: e.target.value }))} placeholder="e.g. Die-cut stickers, Flex printing, Corporate branding…" rows={2} />
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Button 1 Label" value={heroData.btn1} onChange={e => setHeroData(d => ({ ...d, btn1: e.target.value }))} placeholder="Print Sticker" />
            <Input label="Button 2 Label" value={heroData.btn2} onChange={e => setHeroData(d => ({ ...d, btn2: e.target.value }))} placeholder="Print Flex" />
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <Btn onClick={saveHero} disabled={heroSaving}>{heroSaving ? 'Saving…' : '💾 Save Hero Text'}</Btn>
            {heroSaved && <span className="text-sm font-semibold text-emerald-700">✓ Saved! Refresh the site to see changes.</span>}
          </div>
        </Card>
      )}
    </div>
  )
}
