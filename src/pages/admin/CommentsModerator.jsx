import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.webp';

export function CommentsView({ token }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/admin/comments', { headers: authH(token) })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setComments(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function approve(id) {
    await fetch(`/api/admin/comments/${id}/approve`, { method: 'PATCH', headers: authH(token) })
    setComments(prev => prev.map(c => c.id === id ? { ...c, approved: true } : c))
  }

  async function del(id) {
    await fetch(`/api/admin/comments/${id}`, { method: 'DELETE', headers: authH(token) })
    setComments(prev => prev.filter(c => c.id !== id))
  }

  const visible = comments.filter(c => filter === 'all' ? true : filter === 'pending' ? !c.approved : c.approved)
  const pending = comments.filter(c => !c.approved).length

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-[20px] font-extrabold text-slate-900 mb-1">💬 Comment Moderation</h2>
          <p className="text-sm text-slate-500">{pending} pending approval · {comments.length} total</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'approved'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${filter === f ? 'border border-[#7B2FBE] bg-[#7B2FBE] text-white' : 'border border-slate-300 bg-white text-slate-600'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      {loading ? <Card><p className="text-sm text-slate-500 m-0">Loading…</p></Card> : visible.length === 0 ? (
        <Card className="text-center p-12">
          <p className="text-lg font-bold text-slate-900 m-0">No comments here</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map(c => (
            <Card key={c.id} className="p-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-base ${c.approved ? 'bg-emerald-100 border border-emerald-200 text-emerald-700' : 'bg-amber-100 border border-amber-200 text-amber-700'}`}>
                  {c.approved ? '✓' : '⏳'}
                </div>
                <div className="flex-1 min-w-[180px]">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-slate-900">{c.name}</span>
                    <span className="rounded-full bg-indigo-100 px-2 py-1 text-[11px] font-semibold text-[#7B2FBE]">on /{c.slug}</span>
                    <span className="text-[11px] text-slate-400">{new Date(c.timestamp).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    {c.approved && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">✓ Approved</span>}
                  </div>
                  <p className="text-sm leading-7 text-slate-700">{c.comment}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!c.approved && (
                    <button onClick={() => approve(c.id)} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">✓ Approve</button>
                  )}
                  <button onClick={() => del(c.id)} className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">🗑</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
