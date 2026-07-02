import { useState, useEffect, useRef } from 'react'
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.jpg'

const TERMS_VERSION = 'June 2026'
const LS_KEY = 'sbm_terms_v2026'

const TERMS_SECTIONS = [
  { title: 'IMPORTANT: PLEASE READ CAREFULLY BEFORE PLACING AN ORDER', body: 'By accessing our website, uploading artwork, placing an order, making payment, or using any of our services, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.' },
  { title: '1. ABOUT OUR SERVICES', body: 'Sleekblue Media Houz provides printing, branding, die-cut stickers, signage, large-format printing, design, promotional materials, and related services. All orders placed through our website are subject to these Terms & Conditions.' },
  { title: '2. ORDER CONFIRMATION', body: 'Customers are solely responsible for reviewing and confirming:\n• Product size and dimensions\n• Quantity ordered\n• Design and artwork\n• Spelling, grammar, and content\n• Finishing specifications\n• Delivery information\n• Contact details\n\nProduction will only commence after payment has been received and order confirmation has been completed. Once production begins, orders cannot be cancelled.' },
  { title: '3. ARTWORK & DESIGN APPROVAL', body: 'Where artwork previews are provided, customers must carefully review all details before approval. Approval may be given through WhatsApp messages. Once the customer approves a design, the approval becomes final.\n\nSleekblue shall not be responsible for errors relating to:\n• Spelling mistakes\n• Incorrect dimensions\n• Design placement\n• Colour choices approved by the customer\n• Missing information supplied by the customer' },
  { title: '4. CUSTOMER ARTWORK RESPONSIBILITY', body: 'Customers warrant that they own or have permission to use all logos, images, trademarks, designs, and content submitted for printing. Sleekblue Media Houz shall not be liable for any copyright infringement, trademark infringement, or intellectual property disputes arising from customer-submitted materials. The customer agrees to indemnify and hold Sleekblue harmless from any related claims.' },
  { title: '5. MEASUREMENT RESPONSIBILITY', body: 'Customers are fully responsible for providing accurate dimensions. If a customer specifies "Print 3 inches × 4 inches", the product will be produced exactly as instructed. Incorrect measurements supplied by customers do not qualify for refunds, replacements, or reprints. Customers are strongly encouraged to physically take their measurement before confirming an order.' },
  { title: '6. PRODUCT COLOUR DISCLAIMER', body: 'Printed colours may vary slightly from mobile screens, computer monitors, previous print jobs, and digital artwork previews. Minor colour variations are normal within the printing industry and do not qualify for refunds or reprints.' },
  { title: '7. PAYMENT TERMS', body: 'Full payment is required before production begins unless otherwise agreed in writing. Orders remain pending until payment is successfully verified. If a payment is declined, reversed, or disputed, Sleekblue reserves the right to suspend production, withhold delivery, or take appropriate recovery action.' },
  { title: '8. CHARGEBACK & PAYMENT DISPUTES', body: 'Customers agree not to initiate fraudulent chargebacks or payment disputes after receiving products or services. Where a chargeback is initiated despite successful delivery or completion of services, Sleekblue reserves the right to submit evidence including order records, design approvals, delivery records, and communication history. The customer shall remain liable for all legitimate charges and associated recovery costs.' },
  { title: '9. PRODUCTION TIMELINES', body: 'Estimated production and delivery dates are provided for guidance only. Production schedules may be affected by power outages, equipment breakdown, material shortages, public holidays, weather conditions, logistics disruptions, and events beyond our control. Sleekblue shall not be liable for delays caused by such circumstances.' },
  { title: '10. DELIVERY POLICY', body: 'Customers are responsible for providing accurate delivery information. Sleekblue shall not be responsible for delays, failed deliveries, or additional costs resulting from incorrect customer information. Risk transfers to the customer once products are handed over to a courier, transport company, dispatch rider, or designated collection agent.' },
  { title: '11. OPENING & INSPECTION REQUIREMENT', body: 'Customers must inspect orders immediately upon receipt. For any complaint relating to wrong quantity, wrong design, damaged items, or missing items, customers must provide:\n• Order number\n• Clear photos\n• Continuous unedited unboxing video\n\nComplaints must be submitted within 24 hours of delivery. Claims submitted outside this period may not be considered.' },
  { title: '12. REFUND & REPLACEMENT POLICY', body: 'ELIGIBLE CASES — Sleekblue may provide a replacement, reprint, partial refund, or full refund where:\n• Wrong size was produced contrary to approved specifications\n• Wrong quantity was supplied\n• Wrong artwork was printed\n• Production defects occurred due to our error\n\nNON-ELIGIBLE CASES — Refunds, replacements, or reprints will NOT be granted where:\n• Customer supplied incorrect measurements\n• Customer approved artwork containing errors\n• Low-resolution files were submitted\n• Customer changes their mind\n• Customer ordered the wrong quantity\n• Minor colour variations occur\n• Incorrect delivery information was supplied\n• Product damage occurs after delivery\n\nAll claims are subject to verification.' },
  { title: '13. LIMITATION OF LIABILITY', body: 'To the maximum extent permitted by law, Sleekblue Media Houz shall not be liable for loss of profit, loss of business, loss of contracts, indirect damages, or consequential damages. Our maximum liability shall not exceed the amount paid for the specific order in dispute.' },
  { title: '14. PRIVACY', body: 'Customer information is collected solely for order processing, customer support, delivery coordination, and service improvement. We do not sell customer information to third parties.' },
  { title: '15. FORCE MAJEURE', body: 'Sleekblue shall not be liable for any failure or delay caused by events beyond reasonable control, including natural disasters, government actions, civil disturbances, strikes, power failures, pandemics, transportation disruptions, or supplier shortages.' },
  { title: '16. GOVERNING LAW', body: 'These Terms & Conditions shall be governed by and interpreted under the laws of the Federal Republic of Nigeria. Any dispute arising from these Terms shall be subject to the jurisdiction of Nigerian courts.' },
  { title: '17. DISPUTE RESOLUTION', body: 'Before commencing any court action, the customer agrees to first notify Sleekblue Media Houz in writing and allow up to 14 business days for investigation and resolution of the complaint. Both parties shall make reasonable efforts to resolve disputes amicably before resorting to litigation.' },
  { title: '18. ACCEPTANCE OF TERMS', body: 'By clicking "I Agree", placing an order, making payment, uploading artwork, or using our services, you acknowledge that you have read, understood, and accepted these Terms & Conditions in full.\n\nYour acceptance is electronically recorded with date and time, your name, email, phone number, IP address, and the version of these Terms. Electronic records, digital communications, website logs, invoices, and order records may be relied upon as evidence of acceptance.' },
]

<<<<<<< HEAD
function validateFullName(v) {
  const parts = v.trim().split(/\s+/).filter(Boolean)
  return parts.length >= 2 && parts.every(p => p.length >= 2)
}
function validateEmail(v) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v.trim())
}
function validatePhone(v) {
  const digits = v.replace(/[\s\-()+.]/g, '')
  return /^\d{10,15}$/.test(digits)
}

=======
>>>>>>> 0163bd0 (Refactor code structure for improved readability and maintainability)
const F = { fontFamily: "'HubotSans', sans-serif" }

export default function TermsModal({ open = false, onClose = () => {} }) {
  const scrollRef = useRef(null)

<<<<<<< HEAD
  useEffect(() => {
    if (!localStorage.getItem(LS_KEY)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(true)
      setDeclined(false)
    }
  }, [location.pathname])

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 30) setScrolledToBottom(true)
  }

  function blurName(v) {
    if (!v.trim()) return setNameErr('Full name is required')
    if (!validateFullName(v)) return setNameErr('Enter both first and last name (e.g. John Doe)')
    setNameErr('')
  }
  function blurEmail(v) {
    if (!v.trim()) return setEmailErr('Email address is required')
    if (!validateEmail(v)) return setEmailErr('Enter a valid email (e.g. you@gmail.com)')
    setEmailErr('')
  }
  function blurPhone(v) {
    if (!v.trim()) return setPhoneErr('WhatsApp number is required')
    if (!validatePhone(v)) return setPhoneErr('Enter a valid number with 10–15 digits (e.g. 08012345678)')
    setPhoneErr('')
  }

  async function handleAgree() {
    let ok = true
    if (!validateFullName(name)) { setNameErr('Enter both first and last name (e.g. John Doe)'); ok = false } else setNameErr('')
    if (!validateEmail(email))   { setEmailErr('Enter a valid email (e.g. you@gmail.com)'); ok = false }    else setEmailErr('')
    if (!validatePhone(phone))   { setPhoneErr('Enter a valid number with 10–15 digits (e.g. 08012345678)'); ok = false } else setPhoneErr('')
    if (!ok) return

    setSubmitting(true)
    let ipAddress = 'unavailable'
    try {
      const r = await fetch('https://api.ipify.org?format=json')
      ipAddress = (await r.json()).ip
    } catch {}

    const payload = {
      customerName: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      ipAddress,
      termsVersion: TERMS_VERSION,
    }
    let acceptanceId = 'local_' + Date.now()
    try {
      const res = await fetch('/api/accept-terms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) { const d = await res.json(); acceptanceId = d.acceptanceId || acceptanceId }
    } catch {}
    localStorage.setItem('sbm_latest_acceptance', JSON.stringify({ ...payload, acceptanceId, timestamp: new Date().toISOString() }))
    localStorage.setItem(LS_KEY, 'true')
    setSubmitting(false)
    setShow(false)
  }

  if (!show) return null

  const allValid = validateFullName(name) && validateEmail(email) && validatePhone(phone)

  if (declined) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '36px 28px', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>⚠️</div>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#1a1a1a', marginBottom: '10px', ...F }}>Terms Required</h2>
          <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6, marginBottom: '20px', ...F }}>
            You must accept our Terms &amp; Conditions to use Sleekblue Media Houz services. Without acceptance, we cannot process orders.
          </p>
          <button onClick={() => setDeclined(false)} style={{ background: '#7B2FBE', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 26px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', ...F }}>
            Go Back &amp; Review Terms
          </button>
        </div>
      </div>
    )
  }
=======
  if (!open) return null
>>>>>>> 0163bd0 (Refactor code structure for improved readability and maintainability)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.80)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
      <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '520px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 56px rgba(0,0,0,0.38)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: '#7B2FBE', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logo} alt="Sleekblue" style={{ height: '34px', width: 'auto', borderRadius: '5px', background: '#fff', padding: '2px' }} />
            <div>
              <h2 style={{ color: '#fff', fontSize: '14px', fontWeight: 800, margin: 0, ...F }}>Terms &amp; Conditions of Sale</h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '10px', margin: '1px 0 0', ...F }}>Version: {TERMS_VERSION} · Read carefully before continuing</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', fontWeight: 700, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Scrollable body */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', background: '#FAFAFA' }}>
          <div style={{ background: '#FFF8E1', border: '1.5px solid #F9A825', borderRadius: '8px', padding: '10px 13px', marginBottom: '14px' }}>
            <p style={{ fontSize: '11.5px', color: '#7B3F00', margin: 0, fontWeight: 600, lineHeight: 1.5, ...F }}>
              ⚠️ By clicking "I Agree", creating an order, uploading artwork, approving a design, making payment, or using any service, you confirm you have read and accepted these Terms &amp; Conditions.
            </p>
          </div>
          {TERMS_SECTIONS.map((s, i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#7B2FBE', marginBottom: '4px', ...F, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.title}</h3>
              <p style={{ fontSize: '11.5px', color: '#333', lineHeight: 1.65, whiteSpace: 'pre-line', ...F, margin: 0 }}>{s.body}</p>
            </div>
          ))}
          <div style={{ background: '#f0e8ff', border: '1.5px solid #7B2FBE', borderRadius: '8px', padding: '10px 13px', marginTop: '8px' }}>
            <p style={{ fontSize: '11px', color: '#5a1a9b', margin: 0, fontWeight: 600, lineHeight: 1.5, ...F }}>Last Updated: {TERMS_VERSION} · Sleekblue Media Houz</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 18px 16px', background: '#fff', borderTop: '1px solid #eee', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 14px', background: '#7B2FBE', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', ...F }}>Close</button>
        </div>
      </div>
    </div>
  )
}
