import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.webp';

export function ReviewsPendingView({ token }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/reviews', { headers: authH(token) })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setReviews(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function approve(id) {
    await fetch(`/api/admin/reviews/${id}/approve`, { method: 'PATCH', headers: authH(token) })
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  async function del(id) {
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE', headers: authH(token) })
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[20px] font-extrabold text-slate-900 mb-1">⭐ Pending Reviews</h2>
        <p className="text-sm text-slate-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''} awaiting approval. Approved reviews appear on the homepage.</p>
      </div>
      {loading ? <Card><p className="text-sm text-slate-500 m-0">Loading…</p></Card> : reviews.length === 0 ? (
        <Card className="text-center p-12">
          <div className="text-4xl mb-3">⭐</div>
          <p className="text-lg font-bold text-slate-900 mb-2">No pending reviews</p>
          <p className="text-sm text-slate-500">New review submissions will appear here.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl">👤</div>
                <div className="flex-1 min-w-[180px]">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-slate-900">{r.name}</span>
                    {r.location && <span className="text-xs text-slate-500">📍 {r.location}</span>}
                    <span className="text-sm">{'★'.repeat(r.rating || 5)}</span>
                    <span className="text-xs text-slate-400">{new Date(r.timestamp).toLocaleDateString('en-NG')}</span>
                  </div>
                  <p className="text-sm leading-7 text-slate-700">{r.text}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => approve(r.id)} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">✓ Approve</button>
                  <button onClick={() => del(r.id)} className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">✗ Reject</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
