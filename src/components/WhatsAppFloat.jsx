import { useState, useEffect } from 'react'
import { FaWhatsapp } from 'react-icons/fa'

export default function WhatsAppFloat() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function update() {
      setVisible(window.innerWidth >= 768) // show only on tablet+ and desktop
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  if (!visible) return null

  return (
    <a
      href="https://wa.me/2348065275264"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 9999,
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        background: '#25D366',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        textDecoration: 'none',
      }}
    >
      <FaWhatsapp size={24} />
    </a>
  )
}
