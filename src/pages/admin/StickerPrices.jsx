import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.webp';

export function StickerPricesView({ token, stickerPriceOverrides, onDataChanged }) {
  const base = STICKER_SIZE_PRICES
  const merged = { ...base, ...stickerPriceOverrides }
  const [prices, setPrices] = useState(JSON.parse(JSON.stringify(merged)))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newSize, setNewSize] = useState('')
  const [stickerImages, setStickerImages] = useState({})
  const [uploading, setUploading] = useState(null)
  const [showImages, setShowImages] = useState(false)

  useEffect(() => {
    fetch('/api/sticker-images').then(r => r.ok ? r.json() : {}).then(setStickerImages).catch(() => {})
  }, [])

  async function uploadStickerImg(size, file) {
    setUploading(size)
    const fd = new FormData(); fd.append('image', file); fd.append('size', size)
    const res = await fetch('/api/admin/upload/sticker-image', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
    const json = await res.json()
    setUploading(null)
    if (json.url) setStickerImages(prev => ({ ...prev, [size]: [...(prev[size] || []), json.url] }))
  }

  async function deleteStickerImg(size, url) {
    if (!confirm('Remove this image?')) return
    await fetch('/api/admin/sticker-image', { method: 'DELETE', headers: authH(token), body: JSON.stringify({ size, url }) })
    setStickerImages(prev => ({ ...prev, [size]: (prev[size] || []).filter(u => u !== url) }))
  }

  function update(size, field, val) {
    setPrices(prev => ({ ...prev, [size]: { ...prev[size], [field]: parseFloat(val) || 0 } }))
  }

  function addSize() {
    if (!newSize.trim()) return
    setPrices(prev => ({ ...prev, [newSize.trim()]: { p100: 0, p500: 0, p1000: 0 } }))
    setNewSize('')
  }

  async function handleSave() {
    setSaving(true); setSaved(false)
    await fetch('/api/admin/sticker-prices', {
      method: 'PUT', headers: authH(token), body: JSON.stringify(prices),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    onDataChanged()
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Die-Cut Sticker Prices</h2>
      <p className="text-sm text-slate-500 mb-5">
        Edit base prices for all sticker sizes. Bulk discounts (500+, 1000+) are applied automatically. You can also upload showcase images per size.
      </p>

      {/* Price table */}
      <Card className="mb-4">
        <h3 className="text-sm font-bold text-[#7B2FBE] mb-3">💰 Price Matrix</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Size</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">100 pcs (₦ total)</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">500 pcs (₦ total)</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">1,000 pcs (₦ total)</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Unit @ 100</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(prices).map(([size, p]) => {
                const isChanged = JSON.stringify(p) !== JSON.stringify(base[size] || {})
                return (
                  <tr key={size} className={`${isChanged ? 'bg-emerald-50' : ''} border-t border-slate-200`}>
                    <td className="py-3 px-4 font-semibold text-slate-900">{size}</td>
                    {['p100', 'p500', 'p1000'].map(field => (
                      <td key={field} className="py-3 px-4">
                        <input type="number" value={p[field]} onChange={e => update(size, field, e.target.value)}
                          className="w-28 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-center text-slate-900" />
                      </td>
                    ))}
                    <td className="py-3 px-4 text-sm font-semibold text-[#7B2FBE]">₦{(p.p100 / 100).toLocaleString()}/pc</td>
                    <td className="py-3 px-4">
                      {isChanged ? <Badge color="#16a34a">Modified</Badge> : <span className="text-xs text-slate-400">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-200">
          <input value={newSize} onChange={e => setNewSize(e.target.value)} placeholder='Add new size (e.g. 5x5")'
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" />
          <Btn variant="ghost" onClick={addSize}>+ Add Size</Btn>
        </div>
        <SaveBar onSave={handleSave} saving={saving} saved={saved} />
      </Card>

      {/* Sticker size image gallery */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#7B2FBE] mb-1">🖼️ Sticker Showcase Images</h3>
            <p className="text-sm text-slate-500">Upload photos per sticker size — shown on the product page when customers pick that size</p>
          </div>
          <button onClick={() => setShowImages(!showImages)}
            className="rounded-2xl border border-[#7B2FBE66] bg-[#f0e8ff] px-4 py-2 text-sm font-semibold text-[#7B2FBE] hover:bg-[#e8dfff] transition">
            {showImages ? '▲ Collapse' : '▼ Expand'}
          </button>
        </div>

        {showImages && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Object.keys(prices).map(size => {
              const imgs = stickerImages[size] || []
              return (
                <div key={size} className="rounded-2xl border border-[#7B2FBE66] bg-[#f8f4ff] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-[#7B2FBE]">📐 {size}</h4>
                    <Badge color={imgs.length > 0 ? '#16a34a' : '#888'}>{imgs.length} photo{imgs.length !== 1 ? 's' : ''}</Badge>
                  </div>
                  {imgs.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {imgs.map((url, i) => (
                        <div key={i} className="relative h-14 w-14 overflow-hidden rounded-xl border border-slate-200">
                          <img src={url} alt={`${size} sticker`} className="h-full w-full object-cover" />
                          <button onClick={() => deleteStickerImg(size, url)}
                            className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-700 text-[10px] text-white shadow-sm">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="block cursor-pointer">
                    <input type="file" accept="image/*" multiple className="hidden"
                      onChange={e => { Array.from(e.target.files).forEach(f => uploadStickerImg(size, f)) }} />
                    <span className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 px-3 py-2 text-sm font-semibold ${uploading === size ? 'border-slate-400 bg-slate-400 text-white' : 'border-dashed border-[#7B2FBE] bg-white text-[#7B2FBE]'}`}>
                      {uploading === size ? '⏳ Uploading…' : '⬆ Upload Images'}
                    </span>
                  </label>
                  <p className="mt-2 text-xs text-slate-500 text-center">
                    {imgs.length === 0 ? 'Using built-in photo' : 'Custom photos active ✓'}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
