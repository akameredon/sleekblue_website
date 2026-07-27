import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.webp';

export function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return }
      localStorage.setItem('sbm_admin_token', data.token)
      onLogin(data.token)
    } catch {
      setError(import.meta.env.DEV ? 'Cannot connect to the local API. Ensure the backend server is running.' : 'Network error: Unable to reach the server. Please check your internet connection or try again later.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#5a1fa0_0%,#7B2FBE_60%,#9c4de0_100%)] flex items-center justify-center p-5">
      <div className="w-full max-w-md rounded-[20px] bg-white p-10 shadow-[0_24px_64px_rgba(0,0,0,0.22)]">
        <div className="text-center mb-7">
          <img src={logo} alt="Sleekblue" className="mx-auto h-14 rounded-xl bg-white p-1" />
          <h2 className="mt-4 text-xl font-black text-slate-900">Admin Panel</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage your website</p>
        </div>
        <form onSubmit={handleLogin}>
          <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" />
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-14 text-sm text-slate-900 outline-none transition focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-rose-600 mb-3">{error}</p>}
          <Btn onClick={handleLogin} disabled={loading} className="w-full py-3">
            {loading ? 'Signing in…' : '🔐 Sign In'}
          </Btn>
        </form>
        <p className="mt-5 text-center text-[11px] text-slate-400">Sleekblue Media Houz — Admin Access</p>
      </div>
    </div>
  )
}