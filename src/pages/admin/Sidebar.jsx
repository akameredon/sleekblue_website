import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.jpg';

const NAV_ITEMS = [
  { id: 'dashboard',       icon: '📊', label: 'Dashboard' },
  { id: 'page-editor',     icon: '🧩', label: 'Page Editor' },
  { id: 'image-manager',   icon: '🖼️', label: 'Image Manager' },
  { id: 'products',        icon: '🛍️', label: 'Products' },
  { id: 'sticker-prices',  icon: '🏷️', label: 'Sticker Prices' },
  { id: 'blog',            icon: '✍️', label: 'Blog' },
  { id: 'about',           icon: '📖', label: 'About Us' },
  { id: 'content',         icon: '🎨', label: 'Content CMS' },
  { id: 'faq',             icon: '❓', label: 'FAQ Manager' },
  { id: 'seo',             icon: '🔍', label: 'SEO Manager' },
  { id: 'settings',        icon: '⚙️', label: 'Site Settings' },
  { id: 'acceptances',     icon: '📋', label: 'T&C Acceptances' },
  { id: 'security',        icon: '🔑', label: 'Security' },
  { id: 'analytics',       icon: '📈', label: 'Analytics' },
  { id: 'reports',         icon: '💰', label: 'Reports' },
  { id: 'leads',           icon: '📲', label: 'WA Leads' },
  { id: 'promo-banner',    icon: '📣', label: 'Promo Banner' },
  { id: 'activity-log',    icon: '📜', label: 'Activity Log' },
  { id: 'seo-agent',       icon: '🤖', label: 'SEO Agent' },
  { id: 'growth',          icon: '🚀', label: 'Growth Dashboard' },
  { id: 'newsletter',      icon: '📧', label: 'Newsletter' },
  { id: 'comments',        icon: '💬', label: 'Comments' },
  { id: 'reviews-pending', icon: '⭐', label: 'Reviews Pending' },
  { id: 'referrals',       icon: '🔗', label: 'Referrals' },
]

export function SidebarInner({ view, setView, counts, onLogout, onClose }) {
  return (
    <div className="flex flex-col h-full" style={{ background: '#8A88DA' }}>
      <div className="px-4 py-5 border-b border-white/15 text-center flex-shrink-0">
        <img src={logo} alt="Sleekblue" className="mx-auto h-10 rounded-xl bg-white p-1" />
        <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-white/75">Admin Panel</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_ITEMS.map(item => {
          const active = view === item.id
          const badge = item.id === 'products' ? counts.products
            : item.id === 'acceptances' ? counts.acceptances
            : item.id === 'blog' ? counts.blogPosts || 0
            : item.id === 'leads' ? counts.leads || 0
            : 0
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => { setView(item.id); onClose?.() }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${active ? 'bg-white/15 border-l-4 border-white text-white font-semibold shadow-sm' : 'border-l-4 border-transparent text-white hover:bg-white/10 hover:text-white'}`}>
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span className="flex-1 text-sm">{item.label}</span>
              {badge > 0 && <span className="rounded-full bg-[#FF6B00] px-2 py-0.5 text-[10px] font-semibold text-white">{badge}</span>}
            </button>
          )
        })}
      </nav>
      <div className="p-4 border-t border-white/15 flex-shrink-0">
        <Btn variant="ghost" onClick={onLogout} className="w-full bg-white/10 text-white border-white/20 hover:bg-white/15">🚪 Log Out</Btn>
      </div>
    </div>
  )
}

export function Sidebar({ view, setView, counts, onLogout, isOpen, onClose }) {
  return (
    <>
      {/* Desktop: always-visible fixed sidebar */}
      <div className="hidden lg:flex w-[220px] min-h-screen flex-shrink-0 flex-col shadow-inner shadow-slate-900/30">
        <SidebarInner view={view} setView={setView} counts={counts} onLogout={onLogout} />
      </div>

      {/* Mobile: backdrop + slide-in drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-[280px] flex flex-col shadow-2xl lg:hidden transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#8A88DA' }}
      >
        {/* Close button inside drawer */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl leading-none z-10"
          aria-label="Close menu"
        >✕</button>
        <SidebarInner view={view} setView={setView} counts={counts} onLogout={onLogout} onClose={onClose} />
      </div>
    </>
  )
}
