import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.webp';

export function LeadsView({ token }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/admin/leads', { headers: authH(token) })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setLeads(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function deleteLead(id) {
    await fetch(`/api/admin/leads/${id}`, { method: 'DELETE', headers: authH(token) })
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  async function followUp(id) {
    const res = await fetch(`/api/admin/leads/${id}/follow-up`, { method: 'PATCH', headers: authH(token) })
    const data = await res.json()
    setLeads(prev => prev.map(l => l.id === id ? { ...l, followedUp: data.followedUp, followedUpAt: data.followedUp ? new Date().toISOString() : null } : l))
  }

  function exportCSV() {
    const rows = [['Name', 'Phone', 'Date'], ...leads.map(l => [l.name || '', l.phone, new Date(l.timestamp).toLocaleDateString('en-NG')])]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'sleekblue-wa-leads.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  function copyAll() {
    const text = leads.map(l => `${l.name ? l.name + ' — ' : ''}${l.phone}`).join('\n')
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
  }

  function fmt(ts) {
    try { return new Date(ts).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) } catch { return ts }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-[20px] font-extrabold text-slate-900 mb-1">📲 WhatsApp Leads</h2>
          <p className="text-sm text-slate-500">Customers who subscribed via the WhatsApp deals popup</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={copyAll} className="bg-emerald-600 text-white font-semibold text-sm">{copied ? '✓ Copied!' : '📋 Copy All Numbers'}</Btn>
          <Btn onClick={exportCSV} className="bg-[#7B2FBE] text-white font-semibold text-sm">⬇️ Export CSV</Btn>
        </div>
      </div>

      {loading ? (
        <Card><p className="text-sm text-slate-500 m-0">Loading…</p></Card>
      ) : leads.length === 0 ? (
        <Card className="text-center p-12">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-lg font-bold text-slate-900 mb-2">No subscribers yet</p>
          <p className="text-sm text-slate-500">The WhatsApp deals popup is live on your site. Subscribers will appear here.</p>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-sm font-extrabold text-emerald-700 mb-1">{leads.length} Subscriber{leads.length !== 1 ? 's' : ''}</p>
              <p className="text-sm text-slate-600">You can broadcast deals to all these numbers on WhatsApp</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {leads.map((lead, i) => (
              <Card key={lead.id || i} className="flex flex-wrap items-center gap-4 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-lg flex-shrink-0">👤</div>
                <div className="flex-1 min-w-[180px]">
                  <p className="text-sm font-semibold text-slate-900 mb-1">
                    {lead.name || <span className="text-slate-400 font-normal">No name</span>}
                  </p>
                  <p className="text-sm font-semibold text-emerald-600">{lead.phone}</p>
                </div>
                <p className="text-xs text-slate-500 text-right min-w-[90px]">{fmt(lead.timestamp)}</p>
                <a href={`https://wa.me/${lead.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                  className="rounded-2xl bg-emerald-600 px-3 py-2 text-[12px] font-semibold text-white whitespace-nowrap">💬 Chat</a>
                <button onClick={() => followUp(lead.id)}
                  className={`rounded-2xl px-3 py-2 text-[12px] font-semibold whitespace-nowrap ${lead.followedUp ? 'border border-emerald-300 bg-emerald-50 text-emerald-700' : 'border border-slate-300 bg-white text-slate-700'}`}>
                  {lead.followedUp ? '✓ Done' : '📞 Follow Up'}
                </button>
                <button onClick={() => deleteLead(lead.id)}
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-600">🗑</button>
              </Card>
            ))}
          </div>
        </>
      )}

      <Card className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <h3 className="text-sm font-bold text-emerald-700 mb-2">💡 How to use these leads</h3>
        <ul className="space-y-2 text-sm text-slate-600 pl-4">
          <li>Copy all numbers and paste into a WhatsApp broadcast list to send bulk deals</li>
          <li>Export to CSV and import into a CRM or email tool</li>
          <li>Directly chat with individual customers using the "Chat" button</li>
          <li>The popup shows 18 seconds after visiting or after scrolling 35% down the page</li>
        </ul>
      </Card>
    </div>
  )
}
