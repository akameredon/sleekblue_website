import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.webp';

export function AcceptancesView({ acceptances }) {
  const [search, setSearch] = useState('')
  const filtered = acceptances.filter(r =>
    (r.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.phone || '').includes(search)
  )
  const sorted = [...filtered].reverse()

  function exportCSV() {
    const headers = ['Acceptance ID', 'Date & Time', 'Name', 'Email', 'Phone', 'IP Address', 'Terms Version']
    const rows = acceptances.map(r => [
      r.acceptanceId, r.timestamp, r.customerName, r.email, r.phone, r.ipAddress, r.termsVersion,
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v || ''}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'terms-acceptances.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-[20px] font-extrabold text-slate-900 mb-1">T&amp;C Acceptances</h2>
          <p className="text-sm text-slate-500">{acceptances.length} total records</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name, email, phone…"
            className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/20 w-[260px]" />
          <Btn variant="success" onClick={exportCSV}>⬇ Export CSV</Btn>
        </div>
      </div>
      <Card className="p-0 overflow-hidden">
        {sorted.length === 0
          ? <p className="p-6 text-center text-slate-500">No records found.</p>
          : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    {['#', 'Name', 'Email', 'Phone', 'IP Address', 'Date & Time', 'Version', 'Acceptance ID'].map(h => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-bold text-slate-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, i) => (
                    <tr key={i} className="border-t border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-500">{acceptances.length - i}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{r.customerName}</td>
                      <td className="px-4 py-3 text-slate-700">{r.email}</td>
                      <td className="px-4 py-3 text-slate-700">{r.phone}</td>
                      <td className="px-4 py-3 text-[11px] font-mono text-slate-500">{r.ipAddress}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(r.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge>{r.termsVersion}</Badge></td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{r.acceptanceId}</td>
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
