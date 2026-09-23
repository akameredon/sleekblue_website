import { useMemo, useState } from 'react'
import { FiArrowUpRight, FiBell, FiBox, FiCheck, FiChevronDown, FiDownload, FiMenu, FiPlus, FiSearch, FiSettings, FiShield, FiUsers, FiX } from 'react-icons/fi'

const seedCustomers = [
  { initials: 'HC', name: 'Harbor Coffee Co.', contact: 'Maya Johnson', code: 'HBR-042', remaining: 8420, delivered: 12000, status: 'Healthy', color: '#3554d1' },
  { initials: 'PL', name: 'Palm & Linen', contact: 'Theo Okafor', code: 'PML-118', remaining: 2140, delivered: 6000, status: 'Watch', color: '#d4915b' },
  { initials: 'SL', name: 'Sage Lane Studio', contact: 'Nina Walker', code: 'SGL-207', remaining: 460, delivered: 5000, status: 'Reorder', color: '#d85757' },
  { initials: 'MC', name: 'Morrow Candle Co.', contact: 'Ari Kim', code: 'MRW-331', remaining: 6750, delivered: 9000, status: 'Healthy', color: '#6c8f71' },
  { initials: 'NV', name: 'North Vale Market', contact: 'Eden Clarke', code: 'NVM-284', remaining: 1180, delivered: 4800, status: 'Watch', color: '#8a68b7' },
]

const activity = [
  ['Sage Lane Studio', 'Usage logged', '12 min ago', '−240', '#d85757'],
  ['Harbor Coffee Co.', 'Delivery recorded', '48 min ago', '+4,000', '#3554d1'],
  ['Palm & Linen', 'Usage logged', '2 hours ago', '−680', '#d4915b'],
  ['Morrow Candle Co.', 'Customer added', 'Yesterday', 'New', '#6c8f71'],
]

const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value)

export default function StickerBalancePage() {
  const [customers, setCustomers] = useState(seedCustomers)
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const total = customers.reduce((sum, customer) => sum + customer.remaining, 0)
  const attention = customers.filter((customer) => customer.status !== 'Healthy').length
  const filtered = useMemo(() => customers.filter((customer) => `${customer.name} ${customer.code} ${customer.contact}`.toLowerCase().includes(query.toLowerCase())), [customers, query])

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const exportCsv = () => {
    const rows = [['Customer', 'Code', 'Contact', 'Remaining', 'Status'], ...customers.map((c) => [c.name, c.code, c.contact, c.remaining, c.status])]
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    link.download = 'sticker-balance-customers.csv'
    link.click()
    notify('Customer report downloaded')
  }

  const addCustomer = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') || 'New customer')
    const contact = String(form.get('contact') || 'Account owner')
    setCustomers((current) => [{ initials: name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), name, contact, code: `NEW-${Math.floor(100 + Math.random() * 899)}`, remaining: 0, delivered: 0, status: 'Reorder', color: '#3554d1' }, ...current])
    setShowAdd(false)
    notify(`${name} added to your workspace`)
  }

  return <div className="sb-shell">
    <aside className={`sb-sidebar ${mobileNav ? 'sb-sidebar-open' : ''}`}>
      <div className="sb-brand"><div className="sb-brand-mark"><FiBox /></div><div><strong>sticker<span>balance</span></strong><small>by Sleekblue</small></div></div>
      <div className="sb-workspace"><div className="sb-workspace-avatar">SM</div><div><small>Workspace</small><b>Sleekblue Media</b></div><FiChevronDown /></div>
      <p className="sb-nav-label">Workspace</p>
      <button className="sb-nav-item sb-nav-active"><FiArrowUpRight />Overview</button>
      <button className="sb-nav-item" onClick={() => notify('Customer management is ready for live Supabase data')}><FiUsers />Customers<span>{customers.length}</span></button>
      <button className="sb-nav-item" onClick={() => notify('Delivery tracking is ready for live Supabase data')}><FiBox />Deliveries</button>
      <p className="sb-nav-label sb-nav-spaced">Manage</p>
      <button className="sb-nav-item" onClick={() => notify('Analytics view coming soon')}><FiArrowUpRight />Analytics</button>
      <button className="sb-nav-item" onClick={() => notify('Settings view coming soon')}><FiSettings />Settings</button>
      <div className="sb-sidebar-bottom"><div className="sb-help">Need a hand?<span>Visit the help centre <FiArrowUpRight /></span></div><div className="sb-user"><div>AO</div><span><b>Akadonye</b>Administrator</span><FiArrowUpRight /></div></div>
    </aside>
    {mobileNav && <button className="sb-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
    <main className="sb-main">
      <header className="sb-topbar"><button className="sb-mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><FiMenu /></button><div className="sb-breadcrumb">Workspace <span>/</span> <b>Overview</b></div><div className="sb-top-actions"><button onClick={() => notify('You are all caught up')} aria-label="Notifications"><FiBell /><i /></button><div className="sb-divider" /><button className="sb-profile"><span>AO</span>Akadonye<FiChevronDown /></button></div></header>
      <div className="sb-content">
        <section className="sb-welcome"><div><div className="sb-eyebrow">✦ Wednesday, 23 September 2026</div><h1>Good morning, Akadonye<span>.</span></h1><p>Here’s the pulse of your sticker inventory today.</p></div><button className="sb-primary" onClick={() => setShowAdd(true)}><FiPlus />Add customer</button></section>
        <section className="sb-insight"><div className="sb-insight-icon"><FiShield /></div><div><b>Inventory is in good shape</b><span>You have <strong>{formatNumber(total)} stickers</strong> across {customers.length} active customer accounts.</span></div><button onClick={() => notify('Customer overview selected')}>View customers <FiArrowUpRight /></button></section>
        <section className="sb-stats"><div className="sb-stat"><span>Total remaining <em>↗ 8.4%</em></span><strong>{formatNumber(total)}</strong><small>vs. 13,880 last month</small><div className="sb-bars">▂▃▂▅▃▆▅▇▆</div></div><div className="sb-stat"><span>Needs attention <em className="sb-warn">↘ 2.1%</em></span><strong>{String(attention).padStart(2, '0')}</strong><small>1 critical · 2 approaching</small><div className="sb-progress"><i style={{ width: `${Math.max(15, attention / customers.length * 100)}%` }} /></div></div><div className="sb-stat sb-stat-dark"><span>Usage this month <em>↘ 4.6%</em></span><strong>5,260</strong><small>stickers logged across all accounts</small><div className="sb-bars">▂▃▂▅▃▆▅▇▆</div></div></section>
        <section className="sb-section-heading"><div><h2>Customer inventory</h2><p>Monitor balances and keep every account moving.</p></div><button className="sb-secondary" onClick={exportCsv}><FiDownload />Export CSV</button></section>
        <section className="sb-table-card"><div className="sb-toolbar"><div className="sb-search"><FiSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customers or codes" /></div><span className="sb-filter"><i /> All customers <FiChevronDown /></span></div><div className="sb-table"><div className="sb-table-head"><span>Customer</span><span>Remaining balance</span><span>Status</span><span /></div>{filtered.map((customer) => <div className="sb-row" key={customer.code}><div className="sb-customer"><div style={{ background: customer.color }}>{customer.initials}</div><span><b>{customer.name}</b><small>{customer.code} · {customer.contact}</small></span></div><div className="sb-balance"><b>{formatNumber(customer.remaining)}</b><div><i className={`sb-bar-${customer.status.toLowerCase()}`} style={{ width: `${Math.min(100, customer.remaining / Math.max(customer.delivered, 1) * 100)}%` }} /></div><small>of {formatNumber(customer.delivered)}</small></div><span className={`sb-status sb-status-${customer.status.toLowerCase()}`}><i />{customer.status}</span><button className="sb-row-action" onClick={() => notify(`${customer.name} selected`)} aria-label={`Open ${customer.name}`}><FiArrowUpRight /></button></div>)}{filtered.length === 0 && <div className="sb-empty">No customers match “{query}”.</div>}</div><div className="sb-table-footer">Showing {filtered.length} of {customers.length} customers <button onClick={() => notify('All customers view coming soon')}>View all customers <FiArrowUpRight /></button></div></section>
        <section className="sb-bottom-grid"><div className="sb-activity"><div className="sb-card-heading"><div><h2>Recent activity</h2><p>The latest movement across your workspace.</p></div><button onClick={() => notify('Activity history coming soon')}>View all</button></div>{activity.map(([name, action, time, amount, color]) => <div className="sb-activity-row" key={`${name}-${time}`}><i style={{ background: color }} /><span><b>{name}</b><small>{action} · {time}</small></span><strong>{amount}</strong></div>)}</div><div className="sb-tip"><FiCheck /><div className="sb-eyebrow">A little tip</div><h3>Keep your reorder level visible.</h3><p>Customers with less than 1,000 stickers are more likely to need a top-up this week.</p><button onClick={() => notify('Reorder levels are managed in Settings')}>Review thresholds <FiArrowUpRight /></button></div></section>
      </div><footer className="sb-footer">Sticker Balance <span>· Built for real businesses</span><span>Last synced just now <FiCheck /></span></footer>
    </main>
    {toast && <div className="sb-toast"><FiCheck />{toast}<button onClick={() => setToast('')}><FiX /></button></div>}
    {showAdd && <div className="sb-modal-backdrop" onClick={() => setShowAdd(false)}><div className="sb-modal" onClick={(event) => event.stopPropagation()}><div className="sb-card-heading"><div><div className="sb-eyebrow">New account</div><h2>Add a customer</h2></div><button onClick={() => setShowAdd(false)}><FiX /></button></div><form onSubmit={addCustomer}><label>Business name<input name="name" required placeholder="e.g. Sunday Goods" autoFocus /></label><label>Contact person<input name="contact" required placeholder="e.g. Jamie Lee" /></label><div className="sb-modal-actions"><button type="button" className="sb-secondary" onClick={() => setShowAdd(false)}>Cancel</button><button type="submit" className="sb-primary"><FiPlus />Add customer</button></div></form></div></div>}
  </div>
}
