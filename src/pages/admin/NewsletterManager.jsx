import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.jpg';

export function NewsletterView({ token }) {
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/newsletter', { headers: authH(token) })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setSubs(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function exportCSV() {
    const rows = [['Email', 'Name', 'Date'], ...subs.map(s => [s.email, s.name || '', new Date(s.timestamp).toLocaleDateString('en-NG')])]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'sleekblue-newsletter.csv'; a.click(); URL.revokeObjectURL(url)
  }

  async function del(id) {
    await fetch(`/api/admin/newsletter/${id}`, { method: 'DELETE', headers: authH(token) })
    setSubs(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-[20px] font-extrabold text-slate-900 mb-1">📧 Newsletter Subscribers</h2>
          <p className="text-sm text-slate-500">{subs.length} subscriber{subs.length !== 1 ? 's' : ''} collected</p>
        </div>
        <Btn onClick={exportCSV} className="bg-[#7B2FBE] text-white font-semibold text-sm">⬇ Export CSV</Btn>
      </div>
      {loading ? <Card><p className="text-sm text-slate-500 m-0">Loading…</p></Card> : subs.length === 0 ? (
        <Card className="text-center p-12">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-lg font-bold text-slate-900 mb-2">No subscribers yet</p>
          <p className="text-sm text-slate-500">Add the newsletter widget to your site to start collecting emails.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {subs.map((s, i) => (
            <Card key={s.id || i} className="flex flex-wrap items-center gap-4 p-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg bg-[#7B2FBE]/10">📧</div>
              <div className="flex-1 min-w-[180px]">
                <p className="text-sm font-semibold text-slate-900 mb-1">{s.email}</p>
                {s.name && <p className="text-sm text-slate-500 m-0">{s.name}</p>}
              </div>
              <p className="text-xs text-slate-500">{new Date(s.timestamp).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <button onClick={() => del(s.id)} className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">🗑</button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
