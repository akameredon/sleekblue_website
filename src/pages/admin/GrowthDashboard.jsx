import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.jpg';

export function GrowthDashboardView({ token }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    fetch('/api/admin/growth', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-10 text-center text-slate-500">Loading growth data…</div>
  if (!data) return <div className="p-10 text-center text-rose-500">Failed to load growth data.</div>

  const { summary, viewsByDay, leadsByDay, topPages, topProducts, blogPerf, deviceCounts, topCities } = data
  const maxViews = Math.max(...viewsByDay.map(d => d.views), 1)
  const maxLeads = Math.max(...leadsByDay.map(d => d.leads), 1)
  const maxPageViews = Math.max(...(topPages || []).map(p => p.views), 1)
  const maxBlogViews = Math.max(...(blogPerf || []).map(p => p.views), 1)
  const totalDevice = Object.values(deviceCounts || {}).reduce((s, v) => s + v, 0) || 1

  const TABS = ['overview', 'traffic', 'products', 'blog', 'locations']

  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">🚀 Growth Dashboard</h2>
          <p className="text-sm text-slate-500">Last 30 days — updated in real time</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 md:grid-cols-4 mb-7">
        {[
          { label: 'Page Views (30d)', value: summary.totalViews30.toLocaleString(), icon: '👁️', color: '#6366f1' },
          { label: 'New Leads (30d)',  value: summary.totalLeads30.toLocaleString(),  icon: '📲', color: '#22c55e' },
          { label: 'Quote Events',     value: summary.totalQuotes30.toLocaleString(), icon: '📝', color: '#f59e0b' },
          { label: 'Total Leads',      value: summary.totalLeads.toLocaleString(),    icon: '🏆', color: '#ec4899' },
        ].map(k => (
          <div key={k.label} className="rounded-[12px] bg-white p-5 shadow-sm" style={{ borderTop: `3px solid ${k.color}` }}>
            <div className="text-3xl font-bold" style={{ color: k.color }}>{k.icon}</div>
            <div className="mt-3 text-3xl font-bold" style={{ color: k.color }}>{k.value}</div>
            <div className="mt-2 text-xs text-slate-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${tab === t ? 'bg-[#7B2FBE] text-white' : 'bg-slate-100 text-slate-600'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-5">
          {/* Page views chart */}
          <div className="rounded-[12px] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">📈 Page Views — Last 30 Days</h3>
            <div className="flex items-end gap-1 h-[100px] pb-1">
              {viewsByDay.map((d, i) => (
                <div key={i} className="flex-1" title={`${d.date}: ${d.views} views`}>
                  <div className="mx-0 h-full rounded-t-[3px] bg-[#6366f1] transition-all duration-300" style={{ height: `${Math.round((d.views / maxViews) * 90)}px`, opacity: d.views === 0 ? 0.2 : 1 }} />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between text-[10px] text-slate-400">
              <span>{viewsByDay[0]?.date?.slice(5)}</span>
              <span>{viewsByDay[14]?.date?.slice(5)}</span>
              <span>{viewsByDay[29]?.date?.slice(5)}</span>
            </div>
          </div>

          {/* Leads chart */}
          <div className="rounded-[12px] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">📲 New Leads — Last 30 Days</h3>
            <div className="flex items-end gap-1 h-[80px] pb-1">
              {leadsByDay.map((d, i) => (
                <div key={i} className="flex-1" title={`${d.date}: ${d.leads} leads`}>
                  <div className="mx-0 h-full rounded-t-[3px] bg-emerald-500 transition-all duration-300" style={{ height: `${Math.round((d.leads / maxLeads) * 72)}px`, opacity: d.leads === 0 ? 0.2 : 1 }} />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between text-[10px] text-slate-400">
              <span>{leadsByDay[0]?.date?.slice(5)}</span>
              <span>{leadsByDay[14]?.date?.slice(5)}</span>
              <span>{leadsByDay[29]?.date?.slice(5)}</span>
            </div>
          </div>

          {/* Device breakdown */}
          <div className="rounded-[12px] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">📱 Device Breakdown</h3>
            <div className="flex flex-wrap gap-4">
              {Object.entries(deviceCounts || {}).map(([device, count]) => {
                const pct = Math.round((count / totalDevice) * 100)
                const COLORS = { desktop: '#6366f1', mobile: '#22c55e', tablet: '#f59e0b', unknown: '#94a3b8' }
                const color = COLORS[device] || '#94a3b8'
                return (
                  <div key={device} className="min-w-[120px] rounded-[10px] bg-slate-50 p-4 text-center">
                    <div className="mb-1 text-2xl">{device === 'mobile' ? '📱' : device === 'desktop' ? '🖥️' : '📟'}</div>
                    <div className="text-2xl font-bold" style={{ color }}>{pct}%</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.08em] text-slate-500">{device}</div>
                    <div className="text-xs text-slate-400">{count.toLocaleString()} visits</div>
                  </div>
                )
              })}
              {Object.keys(deviceCounts || {}).length === 0 && <div className="text-sm text-slate-400">No device data yet.</div>}
            </div>
          </div>
        </div>
      )}

      {/* Traffic Tab */}
      {tab === 'traffic' && (
        <div className="rounded-[12px] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Top Pages by Views (30d)</h3>
          {topPages.length === 0 ? <div className="text-sm text-slate-400">No page view data yet.</div> : (
            <div className="space-y-3 text-sm text-slate-700">
              {topPages.map(p => (
                <div key={p.page}>
                  <div className="mb-1 flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>{p.page || '/'}</span>
                    <span className="text-[#6366f1] font-semibold">{p.views.toLocaleString()}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#6366f1] transition-all" style={{ width: `${Math.round((p.views / maxPageViews) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {tab === 'products' && (
        <div className="rounded-[12px] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Top Products by Views (30d)</h3>
          {topProducts.length === 0 ? <div className="text-sm text-slate-400">No product view events yet. Product views are tracked when customers open a product page.</div> : (
            <div className="space-y-3 text-sm text-slate-700">
              {topProducts.map(p => (
                <div key={p.slug}>
                  <div className="mb-1 flex items-center justify-between font-medium text-slate-700">
                    <span>{p.name}</span>
                    <span className="text-[#f59e0b] font-semibold">{p.views.toLocaleString()} views</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#f59e0b] transition-all" style={{ width: `${Math.round((p.views / Math.max(...topProducts.map(x => x.views), 1)) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Blog Tab */}
      {tab === 'blog' && (
        <div className="rounded-[12px] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Blog Post Performance</h3>
          {blogPerf.length === 0 ? <div className="text-sm text-slate-400">No published blog posts yet.</div> : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-500">
                    {['Post Title', 'Date', 'Views', 'Bar'].map(h => (
                      <th key={h} className="border-b border-slate-200 px-3 py-2 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {blogPerf.map(p => (
                    <tr key={p.slug} className="border-b border-slate-200 last:border-0">
                      <td className="px-3 py-2 font-medium text-slate-900">{p.title}</td>
                      <td className="px-3 py-2 text-slate-500">{(p.date || '').slice(0, 10)}</td>
                      <td className="px-3 py-2 text-emerald-600 font-semibold">{p.views}</td>
                      <td className="px-3 py-2 w-32">
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round((p.views / maxBlogViews) * 100)}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Locations Tab */}
      {tab === 'locations' && (
        <div className="rounded-[12px] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Top Visitor Cities (30d)</h3>
          {topCities.length === 0 ? <div className="text-sm text-slate-400">No location data yet.</div> : (
            <div className="space-y-3 text-sm text-slate-700">
              {topCities.map(c => (
                <div key={c.city}>
                  <div className="mb-1 flex items-center justify-between font-medium text-slate-700">
                    <span>📍 {c.city}</span>
                    <span className="text-rose-500 font-semibold">{c.views.toLocaleString()} visits</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: `${Math.round((c.views / Math.max(...topCities.map(x => x.views), 1)) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
