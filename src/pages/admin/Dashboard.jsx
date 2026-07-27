import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.webp';

export function DashboardView({ siteData }) {
  const acceptances = siteData.acceptances || []
  const recent = [...acceptances].reverse().slice(0, 8)
  const publishedPosts = (siteData.blogPosts || []).filter(p => p.status === 'published').length
  const draftPosts = (siteData.blogPosts || []).filter(p => p.status === 'draft').length
  const stats = [
    { label: 'Total Products', value: ALL_PRODUCTS.length, icon: '🛍️', color: PRI },
    { label: 'T&C Acceptances', value: acceptances.length, icon: '📋', color: '#16a34a' },
    { label: 'Published Blog Posts', value: publishedPosts, icon: '✍️', color: '#2563eb' },
    { label: 'Draft Posts', value: draftPosts, icon: '📝', color: '#f59e0b' },
    { label: 'Products with Overrides', value: Object.keys(siteData.productOverrides || {}).length, icon: '✏️', color: ACC },
    { label: 'Hero Slides', value: (siteData.heroSlides || 0), icon: '🖼️', color: '#ec4899' },
  ]
  return (
    <div>
      <h2 className="text-2xl font-black text-slate-900 mb-6">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-7">
        {stats.map((s, i) => (
          <Card key={i} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: s.color + '20', color: s.color }}>{s.icon}</div>
            <div>
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <h3 className="text-sm font-bold text-slate-900 mb-4">Recent T&amp;C Acceptances</h3>
        {recent.length === 0
          ? <p className="text-sm text-slate-500">No acceptances yet.</p>
          : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    {['Name', 'Email', 'Phone', 'IP Address', 'Date & Time', 'ID'].map(h => (
                      <th key={h} className="whitespace-nowrap py-2.5 px-3 text-left text-xs font-semibold text-slate-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r, i) => (
                    <tr key={i} className="border-t border-slate-200">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{r.customerName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{r.email}</td>
                      <td className="py-2.5 px-3 text-slate-600">{r.phone}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-500 font-mono">{r.ipAddress}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-500 whitespace-nowrap">{new Date(r.timestamp).toLocaleString()}</td>
                      <td className="py-2.5 px-3"><Badge>{r.acceptanceId?.slice(0,16)}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </Card>
    </div>
  )
}
