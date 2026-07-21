import { useState, useEffect } from 'react'

const KEY = 'sbm_cookie_accepted'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(KEY)) {
      const t = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  function accept() { localStorage.setItem(KEY, '1'); setVisible(false) }
  function decline() { localStorage.setItem(KEY, '0'); setVisible(false) }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#1a1a1a', color: '#fff',
      padding: '16px 24px', display: 'flex', alignItems: 'center',
      gap: '20px', flexWrap: 'wrap', justifyContent: 'space-between',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.25)',
      animation: 'slideUp 0.4s ease',
      fontFamily: "'HubotSans',sans-serif",
    }}>
      <p style={{ margin: 0, fontSize: '13.5px', color: '#ddd', lineHeight: 1.6, flex: 1, minWidth: '240px' }}>
        🍪 We use cookies to improve your experience and analyse site traffic.
        By clicking <strong style={{ color: '#fff' }}>Accept</strong>, you consent to our use of cookies.{' '}
        <a href="/privacy" style={{ color: '#a78bfa', textDecoration: 'underline' }}>Learn more</a>
      </p>
      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        <button onClick={decline}
          style={{ padding: '9px 18px', background: 'transparent', color: '#aaa', border: '1.5px solid #555', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', fontFamily: "'HubotSans',sans-serif" }}>
          Decline
        </button>
        <button onClick={accept}
          style={{ padding: '9px 22px', background: '#7B2FBE', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: "'HubotSans',sans-serif' " }}>
          Accept All
        </button>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  )
}
