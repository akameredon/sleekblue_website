import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.jpg';

export function SeoAgentView({ token }) {
  const [audit, setAudit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  function fetchAudit() {
    setLoading(true)
    fetch('/api/admin/seo-audit', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { setAudit(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchAudit() }, [])

  function scoreColor(s) {
    if (s >= 80) return '#22c55e'
    if (s >= 55) return '#f59e0b'
    return '#ef4444'
  }

  function scoreLabel(s) {
    if (s >= 80) return 'Good'
    if (s >= 55) return 'Needs Work'
    return 'Critical'
  }

  function sevIcon(sev) {
    if (sev === 'critical') return { icon: '🔴', color: '#ef4444' }
    if (sev === 'warn')     return { icon: '🟡', color: '#f59e0b' }
    return { icon: '🔵', color: '#60a5fa' }
  }

  if (loading) return <div className="p-10 text-center text-slate-500">Running SEO audit…</div>
  if (!audit) return <div className="p-10 text-center text-rose-500">Failed to load audit.</div>

  const allPages = [...(audit.pages || []), ...(audit.posts || [])]

  return (
    <div className="mx-auto max-w-[960px]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">🤖 SEO Agent</h2>
          <p className="text-sm text-slate-500">Automated audit across all pages and blog posts</p>
        </div>
        <button onClick={fetchAudit} className="rounded-2xl bg-[#7B2FBE] px-5 py-3 text-sm font-semibold text-white">↻ Re-scan</button>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-4 mb-7">
        {[
          { label: 'Overall Score', value: `${audit.avgScore}`, unit: '/100', color: scoreColor(audit.avgScore) },
          { label: 'Pages Audited', value: audit.total, unit: 'pages', color: '#6366f1' },
          { label: 'Critical Issues', value: audit.critical, unit: 'issues', color: '#ef4444' },
          { label: 'Warnings', value: audit.warnings, unit: 'warnings', color: '#f59e0b' },
        ].map(k => (
          <div key={k.label} className="rounded-[12px] bg-white p-5 shadow-sm" style={{ borderTop: `3px solid ${k.color}` }}>
            <div className="text-3xl font-bold" style={{ color: k.color }}>
              {k.value}
              <span className="ml-1 text-sm font-normal text-slate-400">{k.unit}</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Score dial */}
      <div className="rounded-[12px] bg-white p-6 shadow-sm mb-7">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Page-by-Page Scores</h3>
        <div className="flex flex-col gap-3">
          {allPages.map(p => (
            <div key={p.key}>
              <button
                type="button"
                onClick={() => setExpanded(expanded === p.key ? null : p.key)}
                className="flex w-full items-center gap-3 border-b border-slate-200 py-2 text-left text-sm text-slate-700"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: scoreColor(p.score) }}>
                  {p.score}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900">{p.label}</div>
                  <div className="text-xs text-slate-500">{p.path}</div>
                </div>
                <span className="rounded-full border px-3 py-1 text-[11px] font-semibold" style={{ background: scoreColor(p.score) + '20', color: scoreColor(p.score) }}>{scoreLabel(p.score)}</span>
                <span className="text-xs text-slate-500">
                  {p.issues.length} issue{p.issues.length !== 1 ? 's' : ''} · {p.passes.length} passed · {expanded === p.key ? '▲' : '▼'}
                </span>
              </button>

              {expanded === p.key && (
                <div className="mt-3 flex flex-col gap-4 pl-14 md:flex-row md:gap-6 md:pl-0">
                  <div className="flex-1">
                    {p.issues.length > 0 && (
                      <>
                        <div className="mb-2 text-xs font-semibold text-slate-500">Issues</div>
                        {p.issues.map((iss, i) => {
                          const { icon, color } = sevIcon(iss.sev)
                          return (
                            <div key={i} className="flex items-start gap-2 text-sm text-slate-700 mb-1">
                              <span>{icon}</span>
                              <span style={{ color }}>{iss.msg}</span>
                            </div>
                          )
                        })}
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    {p.passes.length > 0 && (
                      <>
                        <div className="mb-2 text-xs font-semibold text-slate-500">Passing</div>
                        {p.passes.map((pass, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-slate-700 mb-1">
                            <span>✅</span>
                            <span className="text-emerald-600">{pass}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 text-xs font-semibold text-slate-500">Current Meta</div>
                    <div className="text-sm text-slate-700"><strong>Title:</strong> {p.seo.title || <em className="text-rose-500">none</em>}</div>
                    <div className="mt-2 text-sm text-slate-700"><strong>Desc:</strong> {p.seo.description ? p.seo.description.slice(0, 80) + '…' : <em className="text-rose-500">none</em>}</div>
                    {p.seo.canonical && <div className="mt-2 text-sm text-slate-700"><strong>Canonical:</strong> ✓</div>}
                    {p.seo.ogImage && <div className="mt-2 text-sm text-slate-700"><strong>OG Image:</strong> ✓</div>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-[12px] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">💡 Top Recommendations</h3>
        <div className="flex flex-col gap-3">
          {audit.critical > 0 && (
            <div className="rounded-xl border-l-4 border-rose-500 bg-rose-50 p-4 text-sm text-slate-700">
              <strong className="text-rose-600">Critical:</strong> {audit.critical} page{audit.critical !== 1 ? 's are' : ' is'} missing meta title or description — fix these first for maximum SEO impact. Go to <strong>SEO Manager</strong> to set them.
            </div>
          )}
          {audit.warnings > 0 && (
            <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-slate-700">
              <strong className="text-amber-600">Warnings:</strong> {audit.warnings} warning{audit.warnings !== 1 ? 's' : ''} found — check title/description length and add missing canonical/OG image fields.
            </div>
          )}
          <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-4 text-sm text-slate-700">
            <strong className="text-emerald-600">Best practice:</strong> All blog posts should have cover images (used as OG image). Add an Author Name to posts for Article schema credibility.
          </div>
          <div className="rounded-xl border-l-4 border-indigo-500 bg-indigo-50 p-4 text-sm text-slate-700">
            <strong className="text-indigo-600">Growth tip:</strong> Publish at least 2 blog posts/month targeting local keywords like "printing company Owerri" or "die-cut stickers Nigeria" to build organic traffic.
          </div>
        </div>
      </div>
    </div>
  )
}
