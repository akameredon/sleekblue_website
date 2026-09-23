import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiArrowUpRight, FiBell, FiBox, FiCheck, FiChevronDown, FiDownload, FiMenu, FiPlus, FiSearch, FiSettings, FiUsers, FiX } from 'react-icons/fi'
import { supabase } from '../lib/supabase'

const fmt = (n) => new Intl.NumberFormat('en-NG').format(Number(n || 0))
const status = (s) => s === 'REORDER NOW' || s === 'OUT OF STOCK' ? 'Reorder' : s === 'APPROACHING' ? 'Watch' : 'Healthy'
const initials = (s) => String(s || 'Customer').split(' ').map(x => x[0]).join('').slice(0,2).toUpperCase()

export default function StickerBalancePage() {
  const [session,setSession] = useState(null), [profile,setProfile] = useState(null)
  const [customers,setCustomers] = useState([]), [selected,setSelected] = useState(null)
  const [usage,setUsage] = useState([]), [deliveries,setDeliveries] = useState([])
  const [query,setQuery] = useState(''), [loading,setLoading] = useState(true), [busy,setBusy] = useState(false)
  const [error,setError] = useState(''), [toast,setToast] = useState(''), [mobile,setMobile] = useState(false)
  const [showAdd,setShowAdd] = useState(false), [showUsage,setShowUsage] = useState(false), [showDelivery,setShowDelivery] = useState(false)
  const [email,setEmail] = useState(''), [password,setPassword] = useState(''), [authError,setAuthError] = useState('')
  const [add,setAdd] = useState({business_name:'',contact_name:'',contact_email:'',current_delivered:0,reorder_level:500,warning_level:1000})
  const [usageQty,setUsageQty] = useState(''), [delivery,setDelivery] = useState({quantity:'',notes:''})

  const notify = (m) => { setToast(m); setTimeout(() => setToast(''), 3000) }

  const load = useCallback(async () => {
    if (!session) return
    const results = await Promise.all([
      supabase.from('customer_summary').select('*').order('business_name'),
      supabase.from('customers').select('id,customer_code,business_name,contact_name,contact_email,current_delivered,reorder_level,warning_level,is_active').order('business_name'),
      supabase.from('profiles').select('id,full_name,role,customer_code').eq('id',session.user.id).maybeSingle()
    ])
    const summary = results[0], raw = results[1], prof = results[2]
    if(summary.error) throw summary.error; if(raw.error) throw raw.error; if(prof.error) throw prof.error
    setProfile(prof.data)
    const details = new Map((raw.data || []).map(c => [c.customer_code,c]))
    const mapped = (summary.data || []).map(r => { const d = details.get(r.customer_code) || {}; return {...r,...d,remaining:Number(r.remaining_balance || 0),delivered:Number(r.total_delivered || 0),used:Number(r.total_used || 0),status:status(r.status)} })
    setCustomers(mapped)
    setSelected(cur => cur ? mapped.find(x => x.id === cur.id) || null : null)
  },[session])

  useEffect(() => { supabase.auth.getSession().then(({data:{session:s}}) => { setSession(s); setLoading(false) }); const {data:{subscription}} = supabase.auth.onAuthStateChange((_e,s) => setSession(s)); return () => subscription.unsubscribe() },[])
  useEffect(() => { if(session) load().catch(e => setError(e.message || 'Unable to load inventory.')) },[session,load])

  const loadHistory = useCallback(async c => {
    if(!c || !c.id) return
    const results = await Promise.all([
      supabase.from('sticker_logs').select('id,quantity_used,remaining_after,logged_at,logged_by').eq('customer_id',c.id).order('logged_at',{ascending:false}).limit(100),
      supabase.from('deliveries').select('id,quantity_delivered,delivered_at,delivered_by,notes').eq('customer_id',c.id).order('delivered_at',{ascending:false}).limit(100)
    ])
    if(results[0].error) throw results[0].error; if(results[1].error) throw results[1].error
    setUsage(results[0].data || []); setDeliveries(results[1].data || [])
  },[])
  useEffect(() => { if(selected) loadHistory(selected).catch(e => setError(e.message || 'Unable to load history.')); else {setUsage([]);setDeliveries([])} },[selected,loadHistory])

  const signIn = async e => { e.preventDefault(); setAuthError(''); const {error:e2}=await supabase.auth.signInWithPassword({email:email.trim(),password}); if(e2)setAuthError(e2.message) }
  const signOut = async () => { await supabase.auth.signOut(); setCustomers([]); setSelected(null) }

  const addCustomer = async e => {
    e.preventDefault(); if(profile && profile.role !== 'admin') return setError('Only administrators can add customers.')
    const payload={business_name:add.business_name.trim(),contact_name:add.contact_name.trim()||null,contact_email:add.contact_email.trim()||null,current_delivered:Math.max(0,Number(add.current_delivered||0)),reorder_level:Math.max(0,Number(add.reorder_level||0)),warning_level:Math.max(0,Number(add.warning_level||0)),is_active:true}
    if(!payload.business_name) return setError('Business name is required.')
    setBusy(true); setError('')
    const base=payload.business_name.replace(/[^A-Za-z0-9]/g,'').toUpperCase().slice(0,4)||'CUST'
    const result=await supabase.from('customers').insert({...payload,customer_code:base+'-'+Date.now().toString().slice(-6)})
    setBusy(false); if(result.error)return setError(result.error.message)
    setShowAdd(false); setAdd({business_name:'',contact_name:'',contact_email:'',current_delivered:0,reorder_level:500,warning_level:1000}); await load(); notify('Customer added successfully.')
  }

  const recordUsage = async e => {
    e.preventDefault(); const qty=Number(usageQty)
    if(!selected || !Number.isInteger(qty) || qty<=0) return setError('Enter a whole number greater than zero.')
    setBusy(true); setError('')
    const result=await supabase.rpc('record_sticker_usage',{p_customer_id:selected.id,p_quantity_used:qty})
    setBusy(false); if(result.error)return setError(result.error.message)
    setUsageQty(''); setShowUsage(false); await load(); const fresh=customers.find(c=>c.id===selected.id); if(fresh) await loadHistory(fresh); notify(fmt(qty)+' stickers recorded as used.')
  }

  const recordDelivery = async e => {
    e.preventDefault(); const qty=Number(delivery.quantity)
    if(!selected || !Number.isInteger(qty) || qty<=0) return setError('Enter a whole number greater than zero.')
    setBusy(true); setError('')
    const result=await supabase.rpc('add_delivery',{p_customer_id:selected.id,p_quantity_delivered:qty,p_notes:delivery.notes.trim()||null})
    setBusy(false); if(result.error)return setError(result.error.message)
    setDelivery({quantity:'',notes:''}); setShowDelivery(false); await load(); const fresh=customers.find(c=>c.id===selected.id); if(fresh) await loadHistory(fresh); notify(fmt(qty)+' stickers added to inventory.')
  }

  const filtered=useMemo(()=>{const q=query.toLowerCase().trim();return customers.filter(c=>!q||(c.business_name+' '+c.customer_code+' '+(c.contact_name||'')).toLowerCase().includes(q))},[customers,query])
  const total=customers.reduce((s,c)=>s+c.remaining,0), attention=customers.filter(c=>c.status!=='Healthy').length
  const exportCsv=()=>{const rows=[['Customer','Code','Contact','Delivered','Used','Remaining','Status'],...customers.map(c=>[c.business_name,c.customer_code,c.contact_name||'',c.delivered,c.used,c.remaining,c.status])];const csv=rows.map(r=>r.map(x=>'"'+String(x).replaceAll('"','""')+'"').join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='sticker-balance-customers.csv';a.click()}

  if(loading)return <div className="sb-auth-screen"><div className="sb-auth-card"><h1>Sticker<span>Balance</span></h1><p>Loading your workspace…</p></div></div>
  if(!session)return <div className="sb-auth-screen"><div className="sb-auth-card"><h1>Sticker<span>Balance</span></h1><small>by Sleekblue</small><div className="sb-eyebrow">Private workspace</div><h2>Welcome back.</h2><p>Sign in to manage live sticker inventory.</p><form onSubmit={signIn} className="sb-auth-form"><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{authError&&<div className="sb-error">{authError}</div>}<button className="sb-primary" type="submit">Sign in securely <FiArrowUpRight/></button></form></div></div>

  return <div className="sb-shell">
    <aside className={'sb-sidebar '+(mobile?'sb-sidebar-open':'')}><div className="sb-brand"><div className="sb-brand-mark"><FiBox/></div><div><strong>sticker<span>balance</span></strong><small>by Sleekblue</small></div></div><div className="sb-workspace"><div className="sb-workspace-avatar">SM</div><div><small>Workspace</small><b>Sleekblue Media</b></div><FiChevronDown/></div><p className="sb-nav-label">Workspace</p><button className="sb-nav-item active"><FiArrowUpRight/>Overview</button><button className="sb-nav-item" onClick={()=>document.getElementById('customers')?.scrollIntoView({behavior:'smooth'})}><FiUsers/>Customers <span>{customers.length}</span></button><button className="sb-nav-item" onClick={()=>document.getElementById('history')?.scrollIntoView({behavior:'smooth'})}><FiBox/>Deliveries</button><p className="sb-nav-label">Manage</p><button className="sb-nav-item" onClick={()=>notify('Analytics will use live transaction data in a future release.')}><FiArrowUpRight/>Analytics</button><button className="sb-nav-item" onClick={()=>notify('Settings will manage thresholds in a future release.')}><FiSettings/>Settings</button><div className="sb-sidebar-bottom"><div className="sb-user"><div>AO</div><span><b>{profile?.full_name||session.user.email?.split('@')[0]}</b><small>{profile?.role||'customer'}</small></span></div></div></aside>
    {mobile&&<button className="sb-scrim" onClick={()=>setMobile(false)} aria-label="Close navigation"/>}
    <main className="sb-main"><header className="sb-topbar"><button className="sb-mobile-menu" onClick={()=>setMobile(true)}><FiMenu/></button><div className="sb-breadcrumb">Workspace <span>/</span> <b>Overview</b></div><div className="sb-top-actions"><button onClick={()=>notify('Notifications are clear.')}><FiBell/></button><button onClick={signOut}>Sign out <FiChevronDown/></button></div></header>
      <div className="sb-content">{error&&<div className="sb-error sb-global-error"><FiX/>{error}<button onClick={()=>setError('')}><FiX/></button></div>}
        <section className="sb-welcome"><div><div className="sb-eyebrow">Live inventory</div><h1>Good morning, {profile?.full_name?.split(' ')[0]||'Administrator'}<span>.</span></h1><p>Here’s the current pulse of your sticker inventory.</p></div>{profile?.role==='admin'&&<button className="sb-primary" onClick={()=>setShowAdd(true)}><FiPlus/>Add customer</button>}</section>
        <section className="sb-stats"><div className="sb-stat"><span>Total remaining</span><strong>{fmt(total)}</strong><small>across {customers.length} customer accounts</small></div><div className="sb-stat"><span>Needs attention</span><strong>{attention}</strong><small>at or below warning level</small></div><div className="sb-stat sb-stat-dark"><span>Selected usage</span><strong>{selected?fmt(selected.used):'—'}</strong><small>{selected?selected.business_name:'select a customer below'}</small></div></section>
        <section id="customers" className="sb-section-heading"><div><h2>Customer inventory</h2><p>Balances and status come from live Supabase data.</p></div><button className="sb-secondary" onClick={exportCsv}><FiDownload/>Export CSV</button></section>
        <section className="sb-table-card"><div className="sb-toolbar"><div className="sb-search"><FiSearch/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search customers or codes"/></div><span>{filtered.length} of {customers.length}</span></div><div className="sb-table"><div className="sb-table-head"><span>Customer</span><span>Remaining balance</span><span>Status</span><span/></div>{filtered.map(c=><button className={'sb-row '+(selected?.id===c.id?'selected':'')} key={c.id} onClick={()=>setSelected(c)}><span className="sb-customer"><i>{initials(c.business_name)}</i><b>{c.business_name}<small>{c.customer_code} · {c.contact_name||'No contact'}</small></b></span><span className="sb-balance"><b>{fmt(c.remaining)}</b><small>of {fmt(c.delivered)} delivered</small></span><span className={'sb-status sb-status-'+c.status.toLowerCase()}>{c.status}</span><span className="sb-row-action"><FiArrowUpRight/></span></button>)}{!filtered.length&&<div className="sb-empty">No customers match “{query}”.</div>}</div></section>
        {selected&&<section id="history" className="sb-detail"><div className="sb-detail-header"><div><div className="sb-eyebrow">Customer detail</div><h2>{selected.business_name}</h2><p>{selected.customer_code} · {selected.contact_name||'No contact'}{selected.contact_email?' · '+selected.contact_email:''}</p></div><div className="sb-detail-actions"><button className="sb-secondary" onClick={()=>setShowUsage(true)}>Record usage</button>{profile?.role==='admin'&&<button className="sb-primary" onClick={()=>setShowDelivery(true)}><FiPlus/>Add delivery</button>}</div></div><div className="sb-detail-stats"><div><small>Remaining</small><strong>{fmt(selected.remaining)}</strong></div><div><small>Total delivered</small><strong>{fmt(selected.delivered)}</strong></div><div><small>Total used</small><strong>{fmt(selected.used)}</strong></div><div><small>Status</small><strong>{selected.status}</strong></div></div><div className="sb-history-grid"><div className="sb-card"><h3>Usage history</h3>{usage.length?usage.map(x=><div className="sb-history-row" key={x.id}><span><b>{fmt(x.quantity_used)} used</b><small>{new Date(x.logged_at).toLocaleString()}</small></span><strong>{fmt(x.remaining_after)} left</strong></div>):<p className="sb-empty">No usage recorded yet.</p>}</div><div className="sb-card"><h3>Delivery history</h3>{deliveries.length?deliveries.map(x=><div className="sb-history-row" key={x.id}><span><b>+{fmt(x.quantity_delivered)} delivered</b><small>{new Date(x.delivered_at).toLocaleString()}{x.notes?' · '+x.notes:''}</small></span></div>):<p className="sb-empty">No deliveries recorded yet.</p>}</div></div></section>}
      </div></main>
    {toast&&<div className="sb-toast"><FiCheck/>{toast}</div>}
    {showAdd&&<div className="sb-modal-backdrop"><div className="sb-modal"><div className="sb-modal-head"><div><div className="sb-eyebrow">New account</div><h2>Add a customer</h2></div><button onClick={()=>setShowAdd(false)}><FiX/></button></div><form onSubmit={addCustomer} className="sb-form-grid"><label>Business name<input value={add.business_name} onChange={e=>setAdd({...add,business_name:e.target.value})} required/></label><label>Contact person<input value={add.contact_name} onChange={e=>setAdd({...add,contact_name:e.target.value})}/></label><label>Contact email<input type="email" value={add.contact_email} onChange={e=>setAdd({...add,contact_email:e.target.value})}/></label><label>Initial delivery<input type="number" min="0" value={add.current_delivered} onChange={e=>setAdd({...add,current_delivered:e.target.value})}/></label><label>Reorder level<input type="number" min="0" value={add.reorder_level} onChange={e=>setAdd({...add,reorder_level:e.target.value})}/></label><label>Warning level<input type="number" min="0" value={add.warning_level} onChange={e=>setAdd({...add,warning_level:e.target.value})}/></label><div className="sb-modal-actions"><button type="button" className="sb-secondary" onClick={()=>setShowAdd(false)}>Cancel</button><button disabled={busy} className="sb-primary" type="submit">{busy?'Saving…':'Add customer'}</button></div></form></div></div>}
    {showUsage&&selected&&<div className="sb-modal-backdrop"><div className="sb-modal"><div className="sb-modal-head"><div><div className="sb-eyebrow">Inventory movement</div><h2>Record usage</h2><p>{selected.business_name} · {fmt(selected.remaining)} available</p></div><button onClick={()=>setShowUsage(false)}><FiX/></button></div><form onSubmit={recordUsage}><label>Quantity used<input autoFocus type="number" min="1" step="1" value={usageQty} onChange={e=>setUsageQty(e.target.value)} required/></label><div className="sb-modal-actions"><button type="button" className="sb-secondary" onClick={()=>setShowUsage(false)}>Cancel</button><button disabled={busy} className="sb-primary" type="submit">{busy?'Recording…':'Record usage'}</button></div></form></div></div>}
    {showDelivery&&selected&&<div className="sb-modal-backdrop"><div className="sb-modal"><div className="sb-modal-head"><div><div className="sb-eyebrow">Inventory movement</div><h2>Add delivery</h2><p>{selected.business_name}</p></div><button onClick={()=>setShowDelivery(false)}><FiX/></button></div><form onSubmit={recordDelivery}><label>Quantity delivered<input autoFocus type="number" min="1" step="1" value={delivery.quantity} onChange={e=>setDelivery({...delivery,quantity:e.target.value})} required/></label><label>Notes<textarea value={delivery.notes} onChange={e=>setDelivery({...delivery,notes:e.target.value})} rows="3" placeholder="Optional delivery note"/></label><div className="sb-modal-actions"><button type="button" className="sb-secondary" onClick={()=>setShowDelivery(false)}>Cancel</button><button disabled={busy} className="sb-primary" type="submit">{busy?'Saving…':'Add delivery'}</button></div></form></div></div>}
  </div>
}