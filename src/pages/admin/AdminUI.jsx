import React from 'react'

export const PRI = '#7B2FBE'
export const PRI_LIGHT = '#f0e8ff'
export const ACC = '#FF6B00'
export const SIDEBAR_W = '220px'

export function authH(token) {
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
}

export function fmt(n) { return '₦' + Math.round(n).toLocaleString() }

export function Card({ children, className = '' }) {
  return <div className={`rounded-[20px] bg-white p-6 shadow-sm ${className}`}>{children}</div>
}

export function Btn({ children, onClick, variant = 'primary', disabled, className = '', type = 'button' }) {
  const variants = {
    primary: 'bg-[#7B2FBE] text-white hover:bg-[#6826a2] border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent',
    ghost: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold cursor-pointer transition disabled:opacity-55 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${className}`}>
      {children}
    </button>
  )
}

export function Input({ label, value, onChange, type = 'text', placeholder, rows, className = '', readOnly }) {
  const base = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/20 disabled:bg-slate-50'
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block text-xs font-semibold text-slate-600 mb-2">{label}</label>}
      {rows ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          readOnly={readOnly}
          className={`${base} resize-vertical`} />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className={base} />
      )}
    </div>
  )
}

export function Badge({ children, color = PRI, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${className}`} style={{ background: `${color}20`, color }}>
      {children}
    </span>
  )
}

export function SaveBar({ onSave, onCancel, saving, saved, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4 mt-5 ${className}`}>
      <Btn onClick={onSave} disabled={saving} className="min-w-[200px]">
        {saving ? 'Publishing…' : '🚀 Publish to Website'}
      </Btn>
      {onCancel && <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>}
      {saved && <span className="text-sm font-semibold text-emerald-700">✓ Published! Changes are now live.</span>}
    </div>
  )
}
