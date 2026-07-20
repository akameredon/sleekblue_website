import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSEO } from '../hooks/useSEO'
import TermsModal from '../components/TermsModal'

const PAYMENT_METHODS = [
  { id: 'bank', label: 'Bank Transfer' },
  { id: 'paystack', label: 'Pay with Card (Paystack)' },
  { id: 'whatsapp', label: 'WhatsApp Order' },
]

export default function CheckoutPage() {
  useSEO('checkout', { title: 'Checkout — Sleekblue Media Houz', description: 'Complete your printing order with Sleekblue Media Houz. Fast, secure checkout with WhatsApp confirmation.' })
  const navigate = useNavigate()
  const { cartItems, total, discountAmount, discount, clearCart } = useCart()
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [settings, setSettings] = useState({})
  const [paymentMethod, setPaymentMethod] = useState('bank')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : {})
      .then(data => setSettings(data || {}))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (settings.paystackPublicKey) {
      const script = document.createElement('script')
      script.src = 'https://js.paystack.co/v1/inline.js'
      script.async = true
      document.body.appendChild(script)
      return () => {
        document.body.removeChild(script)
      }
    }
  }, [settings.paystackPublicKey])

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/store')
    }
  }, [cartItems.length, navigate])

  useEffect(() => {
    if (!localStorage.getItem('sbm_terms_v2026')) {
      setShowTermsModal(true)
    }
  }, [])

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    if (!form.address.trim()) e.address = 'Delivery address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (paymentMethod === 'paystack' && !settings.paystackPublicKey) e.paymentMethod = 'Paystack is not configured. Choose another payment method.'
    if (!localStorage.getItem('sbm_terms_v2026')) {
      e.terms = 'Please read and accept the terms before placing this order.'
      setShowTermsModal(true)
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function buildWhatsAppMessage() {
    const items = cartItems.map(i => `• ${i.name} (${i.size || 'Standard'}) x${i.quantity} = ₦${(i.price * i.quantity).toLocaleString()}`).join('\n')
    const disc = discount > 0 ? `\nBulk Discount (${Math.round(discount * 100)}%): -₦${discountAmount.toLocaleString()}` : ''
    return encodeURIComponent(
      `🛒 *NEW ORDER - Sleekblue Media Houz*\n\n` +
      `*Customer Details:*\n` +
      `Name: ${form.name}\n` +
      `Phone: ${form.phone}\n` +
      `Email: ${form.email || 'N/A'}\n` +
      `Delivery Address: ${form.address}, ${form.city}\n` +
      `${form.notes ? `Notes: ${form.notes}\n` : ''}` +
      `\n*Order Items:*\n${items}${disc}\n\n` +
      `*ORDER TOTAL: ₦${Math.round(total).toLocaleString()}*\n\n` +
      `Preferred payment: ${paymentMethod === 'bank' ? 'Bank Transfer' : paymentMethod === 'paystack' ? 'Card / Paystack' : 'WhatsApp Order'}\n\n` +
      `Please confirm and process this order. Thank you!`
    )
  }

  function startPaystackPayment() {
    if (!settings.paystackPublicKey) {
      setMessage('Paystack is not configured. Please choose another payment option.')
      return
    }
    if (!window.PaystackPop) {
      setMessage('Paystack is still loading. Please wait a moment and try again.')
      return
    }

    const handler = window.PaystackPop.setup({
      key: settings.paystackPublicKey,
      email: form.email || 'customer@example.com',
      amount: Math.round(total) * 100,
      currency: 'NGN',
      ref: `SBM-${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Customer Name', variable_name: 'customer_name', value: form.name },
          { display_name: 'Phone', variable_name: 'phone', value: form.phone },
        ],
      },
      callback() {
        clearCart()
        setMessage('Payment completed successfully. Thank you!')
        setTimeout(() => navigate('/'), 1400)
      },
      onClose() {
        setMessage('Paystack payment was not completed.')
      },
    })
    handler.openIframe()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    if (!validate()) return
    setSubmitting(true)

    if (paymentMethod === 'paystack') {
      startPaystackPayment()
      setSubmitting(false)
      return
    }

    const msg = buildWhatsAppMessage()
    clearCart()
    window.open(`https://wa.me/2348065275264?text=${msg}`, '_blank')
    setSubmitting(false)
    navigate('/')
  }

  const handleInputChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <section className="bg-slate-50 py-10 min-h-screen">
      <TermsModal open={showTermsModal} onClose={() => setShowTermsModal(false)} onAccepted={() => setShowTermsModal(false)} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-700">Checkout</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">Complete your order</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Choose how you want to pay, provide delivery details, and accept the terms before placing your order.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Delivery information</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Full Name *</span>
                  <input
                    value={form.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    className={`w-full rounded-3xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${errors.name ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white'}`}
                    placeholder="John Doe"
                  />
                  {errors.name && <span className="text-xs text-rose-600">{errors.name}</span>}
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Phone Number *</span>
                  <input
                    value={form.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    className={`w-full rounded-3xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${errors.phone ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white'}`}
                    placeholder="+234 812 345 6789"
                  />
                  {errors.phone && <span className="text-xs text-rose-600">{errors.phone}</span>}
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Email Address</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition"
                    placeholder="you@example.com"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">City *</span>
                  <input
                    value={form.city}
                    onChange={e => handleInputChange('city', e.target.value)}
                    className={`w-full rounded-3xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${errors.city ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white'}`}
                    placeholder="Lagos"
                  />
                  {errors.city && <span className="text-xs text-rose-600">{errors.city}</span>}
                </label>
                <label className="sm:col-span-2 space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Delivery Address *</span>
                  <input
                    value={form.address}
                    onChange={e => handleInputChange('address', e.target.value)}
                    className={`w-full rounded-3xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${errors.address ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white'}`}
                    placeholder="Street, area, landmark"
                  />
                  {errors.address && <span className="text-xs text-rose-600">{errors.address}</span>}
                </label>
                <label className="sm:col-span-2 space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Order notes</span>
                  <textarea
                    value={form.notes}
                    onChange={e => handleInputChange('notes', e.target.value)}
                    className="min-h-[110px] w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition resize-none"
                    placeholder="Any special delivery or design notes"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Payment method</h2>
              <div className="mt-5 space-y-3">
                {PAYMENT_METHODS.map(method => (
                  <label key={method.id} className={`flex cursor-pointer items-center justify-between rounded-3xl border px-4 py-4 transition ${paymentMethod === method.id ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{method.label}</div>
                      <p className="text-sm text-slate-500">
                        {method.id === 'bank' ? 'Use bank transfer instructions set in admin settings.' : method.id === 'paystack' ? 'Pay securely with Visa, Mastercard, or local cards.' : 'Send your order details to WhatsApp for confirmation.'}
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="h-4 w-4 text-violet-700 accent-violet-600"
                    />
                  </label>
                ))}
                {errors.paymentMethod && <div className="text-xs text-rose-600">{errors.paymentMethod}</div>}
              </div>

              {paymentMethod === 'bank' && (
                <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900 mb-2">Bank transfer details</p>
                  <p>{settings.bankName || 'Bank name not set yet'}</p>
                  <p>{settings.accountName || 'Account name not set yet'}</p>
                  <p>{settings.accountNumber || 'Account number not set yet'}</p>
                  <p className="mt-3 text-slate-500">After transfer, message us on WhatsApp with your order details and payment screenshot to confirm.</p>
                </div>
              )}

              {paymentMethod === 'paystack' && !settings.paystackPublicKey && (
                <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  Paystack is not configured yet. Choose bank transfer or WhatsApp order instead.
                </div>
              )}

              {paymentMethod === 'whatsapp' && (
                <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  Your order will be sent to WhatsApp for confirmation and payment instructions.
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={Boolean(localStorage.getItem('sbm_terms_v2026'))}
                    readOnly
                    className="mt-1 h-4 w-4 accent-violet-600"
                  />
                  <div className="text-sm leading-6 text-slate-700">
                    I have read and accepted the{' '}
                    <button type="button" onClick={() => setShowTermsModal(true)} className="font-semibold text-slate-900 underline underline-offset-2 transition hover:text-violet-700">
                      Terms & Conditions
                    </button>.
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  If the checkbox is not checked yet, open the terms above and agree before placing your order.
                </div>
              </div>
              {errors.terms && <div className="mt-3 text-xs text-rose-600">{errors.terms}</div>}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-3xl bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {paymentMethod === 'paystack' ? 'Pay with Paystack' : paymentMethod === 'bank' ? 'Confirm Bank Transfer' : 'Send Order via WhatsApp'}
                </button>
                {message && <p className="text-sm text-slate-600">{message}</p>}
              </div>
            </div>
          </form>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Order summary</h2>
              <div className="mt-5 space-y-4">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">Qty {item.quantity} · {item.size || 'Standard'}</p>
                    </div>
                    <p className="font-semibold text-slate-900">₦{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2 text-sm text-slate-700">
                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Bulk discount</span>
                    <span>−₦{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-slate-200 pt-3 font-bold text-slate-900">
                  <span>Total</span>
                  <span>₦{Math.round(total).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-violet-950/95 p-6 text-white shadow-sm">
              <h3 className="text-lg font-bold">Need help?</h3>
              <p className="mt-3 text-sm leading-6 text-white/80">Chat with us on WhatsApp if you need help with your artwork, delivery details, or payment.</p>
              <a
                href="https://wa.me/2348065275264"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-3xl bg-white px-5 py-3 text-sm font-semibold text-violet-950 transition hover:bg-slate-100"
              >
                Message us on WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
