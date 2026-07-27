import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.jpg';

const DEFAULT_FAQ_ITEMS = [
  { question: 'What types of printing services does Sleekblue Media Houz offer?', answer: 'We offer a wide range of premium printing and branding services including die-cut stickers, flex banners, flyers & posters, business cards, rollup stands, T-shirts & caps, product labels, vehicle branding, signage & billboards, burial brochures, and corporate graphic design.' },
  { question: 'What is the minimum order quantity?', answer: "Minimum order quantities vary by product. For die-cut stickers, our minimum is 100 pieces. For flyers and business cards, it's typically 50–100 pieces. Flex banners and rollup stands can be ordered as a single piece." },
  { question: 'How long does production and delivery take?', answer: 'Standard production takes 1–3 business days for most products. Rush orders can be completed in 24 hours for an additional fee. We deliver nationwide across Nigeria, with delivery typically taking 1–3 extra days depending on your location.' },
  { question: 'Do you offer custom design services?', answer: "Yes! Our in-house design team can create professional artwork for any of our products — from logo design and full brand identity packages to individual print files. Design turnaround is usually 24–48 hours." },
  { question: 'Do you deliver nationwide across Nigeria?', answer: "Absolutely. We deliver to all 36 states and the FCT via trusted courier partners. Whether you're in Lagos, Abuja, Port Harcourt, Kano, or anywhere else in Nigeria, we'll get your prints to you safely." },
  { question: 'How do I place an order and what payment methods do you accept?', answer: 'You can place an order directly on our website or chat with us on WhatsApp at +234 806 527 5264. We accept bank transfers, mobile payments, and online card payments. Once payment is confirmed, your order goes straight to production.' },
]

export function FaqView({ token }) {
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editIdx, setEditIdx] = useState(null)
  const [newQ, setNewQ] = useState('')
  const [newA, setNewA] = useState('')
  const [addMode, setAddMode] = useState(false)

  useEffect(() => {
    fetch('/api/content')
      .then(r => r.ok ? r.json() : null)
      .then(d => { setItems(d?.faq?.length ? d.faq : DEFAULT_FAQ_ITEMS) })
      .catch(() => setItems(DEFAULT_FAQ_ITEMS))
  }, [])

  async function save(updated) {
    setSaving(true)
    const list = updated || items
    await fetch('/api/admin/faq', { method: 'PUT', headers: authH(token), body: JSON.stringify({ faq: list }) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  function deleteItem(i) {
    const next = items.filter((_, idx) => idx !== i)
    setItems(next); save(next)
  }

  function addItem() {
    if (!newQ.trim() || !newA.trim()) return
    const next = [...items, { question: newQ.trim(), answer: newA.trim() }]
    setItems(next); setNewQ(''); setNewA(''); setAddMode(false); save(next)
  }

  function updateItem(i, field, val) {
    const next = items.map((it, idx) => idx === i ? { ...it, [field]: val } : it)
    setItems(next)
  }

  function moveItem(i, dir) {
    if (i + dir < 0 || i + dir >= items.length) return
    const next = [...items]
    ;[next[i], next[i + dir]] = [next[i + dir], next[i]]
    setItems(next); save(next)
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[20px] font-extrabold text-slate-900 mb-1">❓ FAQ Manager</h2>
        <p className="text-sm text-slate-500 m-0">Manage the FAQ section shown on your homepage. These questions are also embedded as schema markup for Google featured snippets.</p>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        {items.map((item, i) => (
          <Card key={i} className="relative">
            {editIdx === i ? (
              <>
                <Input label="Question" value={item.question} onChange={e => updateItem(i, 'question', e.target.value)} />
                <Input label="Answer" rows={3} value={item.answer} onChange={e => updateItem(i, 'answer', e.target.value)} />
                <div className="mt-1 flex flex-wrap gap-2">
                  <Btn onClick={() => { setEditIdx(null); save() }} className="bg-[#7B2FBE] text-white font-semibold">✓ Save</Btn>
                  <Btn variant="ghost" onClick={() => setEditIdx(null)}>Cancel</Btn>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <p className="text-[13.5px] font-bold text-slate-900 mb-1">{item.question}</p>
                    <p className="text-[12.5px] leading-6 text-slate-600 m-0">{item.answer}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <button onClick={() => moveItem(i, -1)} disabled={i === 0} title="Move up"
                      className={`rounded-2xl border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-[12px] ${i === 0 ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-slate-200'}`}>↑</button>
                    <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} title="Move down"
                      className={`rounded-2xl border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-[12px] ${i === items.length - 1 ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-slate-200'}`}>↓</button>
                    <button onClick={() => setEditIdx(i)}
                      className="rounded-2xl border border-[#7B2FBE]/20 bg-[#f0e8ff] px-2.5 py-1.5 text-[12px] font-semibold text-[#7B2FBE]">✏️</button>
                    <button onClick={() => deleteItem(i)}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[12px] text-rose-600">🗑</button>
                  </div>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>

      {addMode ? (
        <Card className="bg-[#f9f5ff] border-[1.5px] border-[#7B2FBE]/20">
          <h4 className="text-[13px] font-bold text-[#7B2FBE] mb-4">Add New Question</h4>
          <Input label="Question" value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="e.g. Do you do same-day delivery?" />
          <Input label="Answer" rows={3} value={newA} onChange={e => setNewA(e.target.value)} placeholder="Enter the detailed answer…" />
          <div className="mt-2 flex flex-wrap gap-3">
            <Btn onClick={addItem} className="bg-[#7B2FBE] text-white font-semibold">✓ Add Question</Btn>
            <Btn variant="ghost" onClick={() => { setAddMode(false); setNewQ(''); setNewA('') }}>Cancel</Btn>
          </div>
        </Card>
      ) : (
        <button onClick={() => setAddMode(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#7B2FBE]/50 bg-white px-5 py-4 text-sm font-semibold text-[#7B2FBE]">
          + Add New FAQ Question
        </button>
      )}

      <Card className="mt-4 rounded-2xl bg-[#f9f5ff] p-4">
        <h3 className="mb-2 text-sm font-bold text-[#7B2FBE]">💡 About FAQ Schema</h3>
        <p className="text-sm leading-7 text-slate-600">
          These FAQ items are automatically embedded as <strong>FAQPage schema markup</strong> in your homepage. This helps Google show your Q&A directly in search results as featured snippets, driving more traffic without paid ads. Aim for 6–10 clear, helpful questions.
        </p>
      </Card>

      {(saved || saving) && (
        <div className={`fixed bottom-6 right-6 z-[9999] rounded-xl px-5 py-3 text-sm font-semibold text-white ${saving ? 'bg-slate-600' : 'bg-emerald-600'}`}>
          {saving ? '⏳ Saving…' : '✓ FAQ saved!'}
        </div>
      )}
    </div>
  )
}
