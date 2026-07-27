import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.webp';

export function ActivityLogView({ token }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    fetch('/api/admin/activity-log', { headers: authH(token) })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setLogs(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-extrabold text-slate-900 mb-1">📜 Activity Log</h2>
          <p className="text-sm text-slate-500 m-0">Recent admin actions — last 200 entries</p>
        </div>
        <Btn variant="ghost" onClick={load}>↻ Refresh</Btn>
      </div>
      {loading ? (
        <Card><p className="m-0 text-sm text-slate-500">Loading…</p></Card>
      ) : logs.length === 0 ? (
        <Card className="text-center p-12">
          <div className="text-4xl mb-3">📜</div>
          <p className="text-base font-semibold text-slate-900 mb-1">No activity recorded yet</p>
          <p className="text-sm text-slate-500 m-0">Activity will appear here as you manage content and settings.</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100">
                  {['Time', 'Action', 'Detail', 'User'].map(h => (
                    <th key={h} className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge>{log.action}</Badge></td>
                    <td className="max-w-[320px] px-4 py-3 text-slate-600 break-words">{log.detail}</td>
                    <td className="px-4 py-3 text-slate-500">{log.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
