import { useState, useEffect, useRef } from 'react'
import { FaStar } from 'react-icons/fa'
import ubaLogo        from '@assets/UBA_LOGO_1779921080597.jpg'
import mtnLogo        from '@assets/MTN_LOGO_1779921080594.jpg'
import heroLogo       from '@assets/HERO_LOGO_1779921080592.jpg'
import imoDigitalLogo from '@assets/IMO_DIGITAL_CITY_LIMITED_LOGO_1779921080594.jpg'
import nnpcLogo       from '@assets/NNPC_LOGO_1779922059067.jpg'
import seplatLogo     from '@assets/SEPLAT_LOGO_1779921080595.jpg'

const LOGO_MAP = {
  UBA:         ubaLogo,
  MTN:         mtnLogo,
  HERO:        heroLogo,
  IMO_DIGITAL: imoDigitalLogo,
  NNPC:        nnpcLogo,
  SEPLAT:      seplatLogo,
}

const DEFAULT_TRUST = {
  rating: '5.0/5',
  reviewCount: '500+',
  tagline: 'TRUSTED BY GLOBAL BRANDS',
  partners: [
    { key: 'UBA', name: 'UBA', visible: true },
    { key: 'MTN', name: 'MTN', visible: true },
    { key: 'HERO', name: 'HERO', visible: true },
    { key: 'IMO_DIGITAL', name: 'Imo Digital City Limited', visible: true },
    { key: 'NNPC', name: 'NNPC', visible: true },
    { key: 'SEPLAT', name: 'Seplat Energy', visible: true },
  ],
}

const STATS = [
  { label: 'Orders Fulfilled', target: 5000, suffix: '+' },
  { label: 'Happy Clients', target: 1200, suffix: '+' },
  { label: 'States Covered', target: 36, suffix: '' },
  { label: 'Years of Excellence', target: 10, suffix: '+' },
]

function useCountUp(target, active) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = 0
    const duration = 1800
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, active])
  return count
}

function StatItem({ label, target, suffix }) {
  const ref = useRef(null)
  const [active, setActive] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const count = useCountUp(target, active)
  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '0 16px' }}>
      <p style={{ fontSize: '28px', fontWeight: 800, color: '#7B2FBE', margin: '0 0 2px', fontFamily: "'HubotSans', sans-serif" }}>
        {count.toLocaleString()}{suffix}
      </p>
      <p style={{ fontSize: '11.5px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px', margin: 0 }}>{label}</p>
    </div>
  )
}

function getLogoSrc(p) {
  if (p.url) return p.url
  return LOGO_MAP[p.key] || null
}

export default function TrustBar() {
  const [data, setData] = useState(DEFAULT_TRUST)

  useEffect(() => {
    fetch('/api/content')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.trustBar) setData({ ...DEFAULT_TRUST, ...d.trustBar, partners: d.trustBar.partners || DEFAULT_TRUST.partners })
      })
      .catch(() => {})
  }, [])

  const visiblePartners = data.partners.filter(p => p.visible !== false)
  const logos = visiblePartners.map(p => ({ src: getLogoSrc(p), alt: p.name })).filter(l => l.src)

  return (
    <section style={{ background: '#fff', padding: '28px 0 24px', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '3px' }}>
            {[1,2,3,4,5].map(i => <FaStar key={i} size={22} color="#F5A623" />)}
          </div>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#333' }}>{data.rating} based on {data.reviewCount} reviews</span>
        </div>
        <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', color: '#888', textTransform: 'uppercase' }}>{data.tagline}</p>
      </div>

      {/* Animated stats bar */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', padding: '18px 24px', margin: '8px auto 12px', maxWidth: '700px', background: '#f9f5ff', borderRadius: '16px', border: '1px solid #e0d6f5' }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <StatItem label={s.label} target={s.target} suffix={s.suffix} />
            {i < STATS.length - 1 && <div style={{ width: '1px', height: '32px', background: '#e0d6f5', margin: '0 8px', flexShrink: 0 }} />}
          </div>
        ))}
      </div>

      {logos.length > 0 && (
        <div style={{ overflow: 'hidden', position: 'relative', marginTop: '14px' }}>
          <style>{`
            @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            .marquee-track { display: flex; align-items: center; width: max-content; animation: marquee 20s linear infinite; }
            .marquee-track:hover { animation-play-state: paused; }
          `}</style>
          <div className="marquee-track">
            {[...logos, ...logos].map((logo, i) => (
              <div key={i} style={{ padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={logo.src} alt={logo.alt} style={{ height: '40px', width: 'auto', objectFit: 'contain', filter: 'grayscale(100%) opacity(0.7)' }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
