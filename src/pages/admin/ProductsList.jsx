import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.webp';
import { ProductEditor } from './ProductEditor';

export function ProductsView({ token, productOverrides, onDataChanged }) {
  const [editingSlug, setEditingSlug] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = ALL_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  if (editingSlug) {
    const base = ALL_PRODUCTS.find(p => p.slug === editingSlug) || {}
    const details = base
    return (
      <ProductEditor
        token={token} slug={editingSlug}
        baseProduct={details}
        override={productOverrides[editingSlug]}
        onSaved={onDataChanged}
        onCancel={() => setEditingSlug(null)}
      />
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-2xl font-black text-slate-900 m-0">Products</h2>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search products…"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none shadow-sm w-full max-w-xs" />
      </div>
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                {['Product Name', 'Category', 'Base Price', 'Status', 'Actions'].map(h => (
                  <th key={h} className="whitespace-nowrap py-3 px-4 text-left font-semibold text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const hasOverride = !!productOverrides[p.slug]
                const priceTbl = p.priceTable || []
                const basePrice = priceTbl.length > 0 ? `₦${(priceTbl[0].unitPrice).toLocaleString()}/pc` : (p.price ? `₦${Number(p.price).toLocaleString()}` : '—')
                return (
                  <tr key={p.id} className="border-t border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-3 px-4 text-slate-500">{p.category}</td>
                    <td className="py-3 px-4 text-slate-600">{basePrice}</td>
                    <td className="py-3 px-4">
                      {hasOverride ? <Badge color="#16a34a">Edited</Badge> : <Badge color="#888">Original</Badge>}
                    </td>
                    <td className="py-3 px-4">
                      <Btn onClick={() => setEditingSlug(p.slug)} className="px-4 py-2 text-xs">✏️ Edit</Btn>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
