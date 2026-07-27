import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.jpg';

export function ProductEditor({ token, slug, baseProduct, override, onSaved, onCancel }) {
  const baseDetails = getProductDetails(slug)
  const merged = { ...baseProduct, ...baseDetails, ...(override || {}) }

  const [name, setName]             = useState(merged.name || '')
  const [category, setCategory]     = useState(merged.category || '')
  const [badge, setBadge]           = useState(merged.badge || '')
  const [description, setDescription] = useState(merged.description || '')
  const [features, setFeatures]     = useState(merged.features ? [...merged.features] : [])
  const [priceTable, setPriceTable] = useState(merged.priceTable ? JSON.parse(JSON.stringify(merged.priceTable)) : [])
  const [sizes, setSizes]           = useState(merged.sizes ? [...merged.sizes] : [])
  const [useVariantPricing, setUseVariantPricing] = useState(!!merged.variantPrices)
  const [variantPrices, setVariantPrices] = useState(() => {
    if (merged.variantPrices) return JSON.parse(JSON.stringify(merged.variantPrices))
    const vp = {}
    ;(merged.sizes || []).filter(Boolean).forEach(s => { vp[s] = JSON.parse(JSON.stringify(merged.priceTable || [])) })
    return vp
  })
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)

  function updateFeature(i, val) { const f = [...features]; f[i] = val; setFeatures(f) }
  function removeFeature(i)      { setFeatures(features.filter((_, idx) => idx !== i)) }
  function addFeature()          { setFeatures([...features, '']) }

  function updateSize(i, val) { const s = [...sizes]; s[i] = val; setSizes(s) }
  function removeSize(i)      { setSizes(sizes.filter((_, idx) => idx !== i)) }
  function addSize()          { setSizes([...sizes, '']) }

  function updateRow(i, field, val) {
    const t = JSON.parse(JSON.stringify(priceTable))
    t[i][field] = field === 'qty' || field === 'unitPrice' ? (parseFloat(val) || 0) : val
    setPriceTable(t)
  }
  function removeRow(i) { setPriceTable(priceTable.filter((_, idx) => idx !== i)) }
  function addRow()     { setPriceTable([...priceTable, { qty: 100, unitPrice: 0 }]) }

  function updateVRow(size, i, field, val) {
    setVariantPrices(prev => ({ ...prev, [size]: prev[size].map((r, idx) => idx === i ? { ...r, [field]: parseFloat(val) || 0 } : r) }))
  }
  function removeVRow(size, i) {
    setVariantPrices(prev => ({ ...prev, [size]: prev[size].filter((_, idx) => idx !== i) }))
  }
  function addVRow(size) {
    setVariantPrices(prev => ({ ...prev, [size]: [...(prev[size] || []), { qty: 100, unitPrice: 0 }] }))
  }
  function syncVariantSizes(newSizes) {
    setVariantPrices(prev => {
      const vp = { ...prev }
      newSizes.filter(Boolean).forEach(s => { if (!vp[s]) vp[s] = JSON.parse(JSON.stringify(priceTable)) })
      return vp
    })
  }

  async function handleSave() {
    setSaving(true); setSaved(false)
    const payload = { name, category, badge, description, features, priceTable, sizes, variantPrices: useVariantPricing ? variantPrices : null }
    await fetch(`/api/admin/products/${slug}`, {
      method: 'PUT', headers: authH(token), body: JSON.stringify(payload),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    onSaved()
  }

  async function handleReset() {
    if (!confirm('Remove all overrides and restore original data for this product?')) return
    await fetch(`/api/admin/products/${slug}`, { method: 'DELETE', headers: authH(token) })
    onSaved(); onCancel()
  }

  const isDieCut = !!baseProduct.isDieCut

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <button onClick={onCancel} className="text-2xl text-slate-500 hover:text-slate-700">←</button>
        <h2 className="text-xl font-black text-slate-900 m-0">Edit: {baseProduct.name}</h2>
        {override && <Badge color="#16a34a">Has overrides</Badge>}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Basic Information</h3>
          <Input label="Product Name" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Category" value={category} onChange={e => setCategory(e.target.value)} />
          <Input label="Badge Label (e.g. Best Seller)" value={badge} onChange={e => setBadge(e.target.value)} />
          <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} rows={4} />
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Features List</h3>
          {features.map((f, i) => (
            <div key={i} className="flex flex-wrap gap-2 mb-2">
              <input value={f} onChange={e => updateFeature(i, e.target.value)}
                placeholder={`Feature ${i+1}`}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" />
              <button onClick={() => removeFeature(i)} className="rounded-2xl bg-rose-100 px-3 text-sm font-semibold text-rose-700">×</button>
            </div>
          ))}
          <Btn variant="ghost" onClick={addFeature} className="mt-1">+ Add Feature</Btn>
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Available Sizes / Types</h3>
          {sizes.map((s, i) => (
            <div key={i} className="flex flex-wrap gap-2 mb-2">
              <input value={s} onChange={e => updateSize(i, e.target.value)}
                placeholder={`Size/Type ${i+1}`}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none" />
              <button onClick={() => removeSize(i)} className="rounded-2xl bg-rose-100 px-3 text-sm font-semibold text-rose-700">×</button>
            </div>
          ))}
          <Btn variant="ghost" onClick={addSize} className="mt-1">+ Add Size</Btn>
        </Card>

        {!isDieCut && (
          <Card>
            <h3 className="text-sm font-bold text-[#7B2FBE] mb-1">Price Table</h3>
            <p className="text-sm text-slate-500 mb-4">Enter quantity and unit price per piece (in ₦)</p>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="py-2.5 px-3 text-left font-semibold text-slate-700">Qty (pcs)</th>
                    <th className="py-2.5 px-3 text-left font-semibold text-slate-700">Unit Price (₦/pc)</th>
                    <th className="py-2.5 px-3 text-left font-semibold text-slate-700">Total</th>
                    <th className="py-2.5 px-3" />
                  </tr>
                </thead>
                <tbody>
                  {priceTable.map((row, i) => (
                    <tr key={i} className="border-t border-slate-200">
                      <td className="py-2.5 px-3">
                        <input type="number" value={row.qty} onChange={e => updateRow(i, 'qty', e.target.value)}
                          className="w-20 rounded-2xl border border-slate-200 px-2 py-1 text-sm text-center text-slate-900" />
                      </td>
                      <td className="py-2.5 px-3">
                        <input type="number" value={row.unitPrice} onChange={e => updateRow(i, 'unitPrice', e.target.value)}
                          className="w-24 rounded-2xl border border-slate-200 px-2 py-1 text-sm text-center text-slate-900" />
                      </td>
                      <td className="py-2.5 px-3 text-[#7B2FBE] font-semibold">{fmt(row.qty * row.unitPrice)}</td>
                      <td className="py-2.5 px-3">
                        <button onClick={() => removeRow(i)} className="rounded-2xl bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Btn variant="ghost" onClick={addRow} className="mt-2">+ Add Row</Btn>
          </Card>
        )}
        {isDieCut && (
          <Card>
            <h3 className="text-sm font-bold text-[#7B2FBE] mb-2">Die-Cut Sticker Pricing</h3>
            <p className="text-sm text-slate-500">
              Sticker prices are managed in the <strong className="text-[#7B2FBE]">Sticker Prices</strong> section. Click it in the sidebar to edit the full price matrix.
            </p>
          </Card>
        )}

        {!isDieCut && sizes.filter(Boolean).length > 1 && (
          <Card className="lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#7B2FBE] mb-1">Per-Variant Pricing</h3>
                <p className="text-sm text-slate-500">Set a different price table for each size/type variant</p>
              </div>
              <button type="button" onClick={() => { const v = !useVariantPricing; setUseVariantPricing(v); if (v) syncVariantSizes(sizes) }}
                className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700">
                <span className="relative block h-5 w-10 rounded-full">
                  <span className={`absolute inset-0 rounded-full transition ${useVariantPricing ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                  <span className={`absolute top-1 h-3 w-3 rounded-full bg-white shadow-sm transition-all ${useVariantPricing ? 'left-6' : 'left-1'}`} />
                </span>
                <span className={useVariantPricing ? 'text-emerald-600' : 'text-slate-400'}>{useVariantPricing ? '✓ Enabled' : 'Disabled'}</span>
              </button>
            </div>
            {!useVariantPricing && (
              <p className="text-sm text-slate-500">Currently using the shared Price Table above for all sizes. Toggle on to set individual prices per size.</p>
            )}
            {useVariantPricing && (
              <div className="grid gap-4 xl:grid-cols-3 mt-3">
                {sizes.filter(Boolean).map(size => (
                  <div key={size} className="rounded-2xl border p-4 bg-[#f0e8ff66] border-[#7B2FBE66]">
                    <h4 className="text-xs font-bold text-[#7B2FBE] mb-2">📐 {size}</h4>
                    <table className="min-w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-[#e9e7ff]">
                          <th className="py-1.5 px-2 text-left">Qty</th>
                          <th className="py-1.5 px-2 text-left">Unit ₦</th>
                          <th className="py-1.5 px-2 text-left">Total</th>
                          <th className="py-1.5 px-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {(variantPrices[size] || []).map((row, i) => (
                          <tr key={i} className="border-t border-[#e8dfff]">
                            <td className="py-1.5 px-2">
                              <input type="number" value={row.qty} onChange={e => updateVRow(size, i, 'qty', e.target.value)}
                                className="w-16 rounded-2xl border border-slate-200 px-2 py-1 text-xs text-center text-slate-900" />
                            </td>
                            <td className="py-1.5 px-2">
                              <input type="number" value={row.unitPrice} onChange={e => updateVRow(size, i, 'unitPrice', e.target.value)}
                                className="w-20 rounded-2xl border border-slate-200 px-2 py-1 text-xs text-center text-slate-900" />
                            </td>
                            <td className="py-1.5 px-2 text-xs font-semibold text-[#7B2FBE] whitespace-nowrap">{fmt(row.qty * row.unitPrice)}</td>
                            <td className="py-1.5 px-2">
                              <button onClick={() => removeVRow(size, i)} className="rounded-xl bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">×</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button onClick={() => addVRow(size)} className="mt-3 rounded-2xl bg-[#f0e8ff] border border-[#7B2FBE66] px-3 py-2 text-xs font-semibold text-[#7B2FBE]">
                      + Add Row
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4 mt-5">
        <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : '💾 Save Changes'}</Btn>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        {override && <Btn variant="danger" onClick={handleReset} className="ml-auto">↺ Reset to Original</Btn>}
        {saved && <span className="text-sm font-semibold text-emerald-700">✓ Saved!</span>}
      </div>
    </div>
  )
}
