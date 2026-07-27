import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.jpg';

export function SecurityView({ token }) {
  const [current, setCurrent]   = useState('')
  const [next, setNext]         = useState('')
  const [confirm, setConfirm]   = useState('')
  const [msg, setMsg]           = useState(null)
  const [saving, setSaving]     = useState(false)

  async function handleChange() {
    setMsg(null)
    if (next !== confirm) { setMsg({ type: 'error', text: 'New passwords do not match.' }); return }
    if (next.length < 6)  { setMsg({ type: 'error', text: 'Password must be at least 6 characters.' }); return }
    setSaving(true)
    const res = await fetch('/api/admin/password', {
      method: 'PUT', headers: authH(token), body: JSON.stringify({ currentPassword: current, newPassword: next }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setMsg({ type: 'error', text: data.error || 'Failed.' }); return }
    setMsg({ type: 'success', text: 'Password changed successfully!' })
    setCurrent(''); setNext(''); setConfirm('')
  }

  return (
    <div>
      <h2 className="text-[20px] font-extrabold text-slate-900 mb-5">Security</h2>
      <div className="max-w-xl">
        <Card>
          <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Change Admin Password</h3>
          <Input label="Current Password" type="password" value={current} onChange={e => setCurrent(e.target.value)} />
          <Input label="New Password" type="password" value={next} onChange={e => setNext(e.target.value)} />
          <Input label="Confirm New Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
          {msg && (
            <div className={`rounded-2xl mb-3 px-4 py-3 text-sm ${msg.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {msg.text}
            </div>
          )}
          <Btn onClick={handleChange} disabled={saving}>{saving ? 'Changing…' : '🔑 Change Password'}</Btn>
        </Card>
        <Card className="mt-4 bg-amber-50 border border-amber-200">
          <h4 className="text-sm font-bold text-amber-900 mb-2">⚠️ Security Reminder</h4>
          <p className="text-sm text-amber-900 leading-7">
            Keep your admin password secure. Do not share it with anyone. The admin panel gives full access to all site data and settings.
          </p>
        </Card>
      </div>
    </div>
  )
}
