import { useState, useEffect } from 'react'

export default function PromoBanner() {
  const [banner, setBanner] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/promo-banner')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.enabled) setBanner(data) })
      .catch(() => {})
  }, [])

  if (!banner || dismissed) return null

  return (
    <div style={{
      background: banner.bgColor || '#f5f0ff',
      borderBottom: `2px solid ${banner.color || '#7B2FBE'}20`,
      padding: '10px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '16px', position: 'relative',
      fontFamily: "'HubotSans',sans-serif",
      animation: 'fadeIn 0.5s ease',
    }}>
      <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: banner.color || '#7B2FBE', textAlign: 'center', lineHeight: 1.5 }}>
        {banner.text}
        {banner.link && (
          <a href={banner.link} style={{ marginLeft: '12px', color: banner.color || '#7B2FBE', fontWeight: 800, textDecoration: 'underline' }}>
            Learn more →
          </a>
        )}
      </p>
      <button onClick={() => setDismissed(true)}
        style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: banner.color || '#7B2FBE', fontSize: '18px', lineHeight: 1, padding: '4px', opacity: 0.6 }}
        aria-label="Dismiss banner">×</button>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  )
}
