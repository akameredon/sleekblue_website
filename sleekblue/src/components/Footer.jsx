import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa'
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.jpg'

const DEFAULT_TAGLINE = 'Premium print, branding & design solutions for businesses across Nigeria. Fast turnaround, zero stress.'
const DEFAULT_SERVICES = ['Die Cut Stickers', 'Flex Banners', 'Business Cards', 'Vehicle Branding', 'Logo & Branding', 'T-Shirts & Caps', 'Rollup Stands', 'Burial Brochures']

const SERVICE_LINKS = {
  'Die Cut Stickers': '/store',
  'Flex Banners': '/store',
  'Business Cards': '/store',
  'Vehicle Branding': '/store',
  'Logo & Branding': '/store',
  'T-Shirts & Caps': '/store',
  'Rollup Stands': '/store',
  'Burial Brochures': '/store',
}

export default function Footer() {
  const year = new Date().getFullYear()
  const [tagline, setTagline] = useState(DEFAULT_TAGLINE)
  const [services, setServices] = useState(DEFAULT_SERVICES)
  const [settings, setSettings] = useState({})
  const [email, setEmail] = useState('')
  const [subStatus, setSubStatus] = useState(null)
  const [subLoading, setSubLoading] = useState(false)

  useEffect(() => {
    fetch('/api/content')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.footer?.tagline) setTagline(d.footer.tagline)
        if (d?.footer?.services?.length) setServices(d.footer.services)
      })
      .catch(() => {})

    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setSettings(d) })
      .catch(() => {})
  }, [])

  const phone = settings.phone || '+234 806 527 5264'
  const whatsapp = settings.whatsapp || '2348065275264'
  const emailAddr = settings.email || ''
  const address = settings.address || 'Lagos, Nigeria'

  async function handleSubscribe(e) {
    e.preventDefault()
    if (!email.trim()) return
    setSubLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (res.ok) {
        setSubStatus('success')
        setEmail('')
      } else {
        setSubStatus('error')
      }
    } catch {
      setSubStatus('error')
    }
    setSubLoading(false)
    setTimeout(() => setSubStatus(null), 4000)
  }

  return (
    <footer className="bg-[#1a0a2e] text-[#ccc] pt-14 pb-7">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4 mb-11">
          <div>
            <img src={logo} alt="Sleekblue Media Houz" className="mb-4 h-14 rounded-xl" />
            <p className="mb-5 text-sm leading-7 text-[#aaa]">{tagline}</p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:opacity-90"
              >
                <FaWhatsapp size={20} />
              </a>
              <a
                href="https://www.instagram.com/sleekbluemediahouz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888] text-white transition hover:opacity-90"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/sleekbluemediahouz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white transition hover:opacity-90"
              >
                <FaFacebook size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-white">Quick Links</h4>
            {[
              { label: 'Home', to: '/' },
              { label: 'Store', to: '/store' },
              { label: 'Request a Quote', to: '/quote' },
              { label: 'About Us', to: '/about' },
              { label: 'Blog', to: '/blog' },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="mb-2 block text-sm text-[#aaa] transition-colors duration-150 hover:text-[#FF6B00]"
              >
                {label}
              </Link>
            ))}
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-white">Services</h4>
            {services.map((s, i) => (
              <Link
                key={i}
                to={SERVICE_LINKS[s] || '/store'}
                className="mb-2 block text-sm text-[#aaa] transition-colors duration-150 hover:text-[#FF6B00]"
              >
                {s}
              </Link>
            ))}
          </div>

          <div>
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-white">Contact Us</h4>
            <p className="mb-3 text-sm leading-6 text-[#aaa]">
              📞 <a href={`tel:${phone}`} className="text-[#aaa] hover:text-white">{phone}</a>
            </p>
            <p className="mb-3 text-sm text-[#aaa]">
              <FaWhatsapp className="mr-2 inline-block align-middle text-[#25D366]" />
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp Us</a>
            </p>
            {emailAddr && (
              <p className="mb-3 text-sm text-[#aaa]">
                ✉️ <a href={`mailto:${emailAddr}`} className="text-[#aaa] hover:text-white">{emailAddr}</a>
              </p>
            )}
            <p className="mb-4 text-sm text-[#aaa]">📍 {address}</p>
            <Link
              to="/quote"
              className="inline-flex rounded-2xl bg-[#FF6B00] px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
            >
              Request a Quote
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mb-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Stay in the loop 📬</h4>
              <p className="text-sm text-[#888]">Get offers, printing tips & updates delivered to your inbox.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 w-full max-w-3xl">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="min-w-[200px] flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-300 transition focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/20"
              />
              <button
                type="submit"
                disabled={subLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-[#7B2FBE] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6b23ba] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {subLoading ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
          </div>
          {subStatus === 'success' && (
            <p className="mt-3 text-sm font-semibold text-emerald-400">✓ You're subscribed! Thanks for joining.</p>
          )}
          {subStatus === 'error' && (
            <p className="mt-3 text-sm font-semibold text-rose-400">Something went wrong. Please try again.</p>
          )}
        </div>

        <div className="border-t border-white/10 pt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-[#666]">
          <p>© {year} Sleekblue Media Houz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
