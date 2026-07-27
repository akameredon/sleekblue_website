import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.jpg';

export function ReferralsView({ token }) {
  const [refs, setRefs] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', contact: '' })
  const [creating, setCreating] = useState(false)
  const [newRef, setNewRef] = useState(null)

  useEffect(() => {
    fetch('/api/admin/referrals', { headers: authH(token) })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setRefs(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function create() {
    if (!form.name.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/referral/generate', { method: 'POST', headers: { ...authH(token), 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (data.ok) { setNewRef(data); setRefs(prev => [{ id: data.code, code: data.code, name: form.name, contact: form.contact, createdAt: new Date().toISOString(), clicks: 0 }, ...prev]); setForm({ name: '', contact: '' }) }
    } catch {}
    setCreating(false)
  }

  async function del(id) {
    await fetch(`/api/admin/referrals/${id}`, { method: 'DELETE', headers: authH(token) })
    setRefs(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[20px] font-extrabold text-slate-900 mb-1">🔗 Referral Links</h2>
        <p className="text-sm text-slate-500">Create unique referral links for partners and track their performance.</p>
      </div>

      <Card className="mb-5">
        <h3 className="mb-4 text-sm font-bold text-[#7B2FBE]">Generate New Referral Link</h3>
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] items-end">
          <Input label="Partner Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Tunde Bakare" />
          <Input label="Contact (optional)" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="Phone or email" />
          <button onClick={create} disabled={creating || !form.name.trim()}
            className="rounded-2xl bg-[#7B2FBE] px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50">
            {creating ? '⏳' : '+ Create'}
          </button>
        </div>
        {newRef && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="mb-2 text-xs font-bold text-emerald-700">✓ Link created!</p>
            <p className="text-sm text-slate-600 break-words">
              <strong>URL:</strong> {newRef.url}
            </p>
            <button onClick={() => navigator.clipboard.writeText(newRef.url)}
              className="mt-3 rounded-2xl bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white">
              📋 Copy Link
            </button>
          </div>
        )}
      </Card>

      {loading ? <Card><p className="text-sm text-slate-500 m-0">Loading…</p></Card> : refs.length === 0 ? (
        <Card className="text-center p-8">
          <p className="text-lg font-bold text-slate-900 m-0">No referral links yet</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {refs.map(r => (
            <Card key={r.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="flex-1 min-w-[180px]">
                <p className="text-sm font-semibold text-slate-900 mb-1">{r.name}</p>
                <p className="mb-1 text-sm font-mono text-slate-500">
                  sleekbluemediahouz.com?ref=<strong className="text-[#7B2FBE]">{r.code}</strong>
                </p>
                {r.contact && <p className="text-xs text-slate-400">{r.contact}</p>}
              </div>
              <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-center">
                <p className="text-xl font-extrabold text-[#7B2FBE] mb-1">{r.clicks || 0}</p>
                <p className="text-[10px] text-slate-500">Clicks</p>
              </div>
              <button onClick={() => navigator.clipboard.writeText(`https://sleekbluemediahouz.com?ref=${r.code}`)}
                className="rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-[#7B2FBE]">📋</button>
              <button onClick={() => del(r.id)} className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">🗑</button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
