import { useState, useEffect } from 'react'
import sleekblueLogo from '@assets/SLEEKBLUE_LOGO_1779921080596.jpg'
import { useSEO } from '../hooks/useSEO'
import HeroCanvas from '../components/HeroCanvas'

const DEFAULT_TEAM = [
  { name: 'CEO & Founder', role: 'Creative Director', bio: 'Driving Sleekblue\'s vision with 10+ years in printing & branding excellence across Nigeria.', initials: 'SB' },
  { name: 'Design Team', role: 'Senior Graphic Designers', bio: 'Transforming bold ideas into stunning, print-ready artwork that commands attention every time.', initials: 'DT' },
  { name: 'Production Team', role: 'Print Production Experts', bio: 'Executing every order with precision and speed — delivering quality you can see and feel.', initials: 'PT' },
]

const DEFAULTS = {
  heroTitle: 'About Sleekblue Media Houz',
  heroSubtitle: 'We print for the biggest brands — and yours is next.',
  whoWeAreTitle: 'Who We Are',
  whoWeAre: 'Sleekblue Media Houz is a premium printing and corporate branding company dedicated to helping businesses of all sizes — from solopreneurs to big brands — communicate their identity with clarity and confidence. We specialize in die-cut stickers, flex printing, large format printing, corporate branding, and a wide range of promotional materials.',
  missionTitle: 'Our Mission',
  mission: 'To deliver premium printing with zero stress — high quality output, fast turnaround, and reliable service that empowers small businesses and enterprise brands alike to stand out in their market.',
  valuesTitle: 'What Sets Us Apart',
  values: [
    { icon: '🎯', title: 'Precision', desc: 'Every cut, every print is executed to exact specifications.' },
    { icon: '⚡', title: 'Speed', desc: 'Fast turnaround without compromising on quality.' },
    { icon: '💎', title: 'Quality', desc: 'Waterproof, durable materials that last and impress.' },
    { icon: '🤝', title: 'Trust', desc: 'Trusted by UBA, MTN, HERO, NNPC, Seplat, and 500+ brands.' },
    { icon: '💰', title: 'Value', desc: 'Bulk discounts for growing businesses.' },
    { icon: '🛠️', title: 'Support', desc: '24/7 customer care and WhatsApp-first communication.' },
  ],
  whoWeServeTitle: 'Who We Serve',
  whoWeServe: ['Solopreneurs & Micro Businesses', 'Small Business Owners', 'Growth Business Enterprises', 'Big Brands & Corporate Organizations'],
  teamTitle: 'Meet the Team',
  team: DEFAULT_TEAM,
  showTeam: true,
  ctaTitle: 'Ready to Print?',
  ctaText: 'Call us or chat on WhatsApp — we respond fast.',
  stats: [
    { value: '500+', label: 'Happy Clients' },
    { value: '5★', label: 'Google Rating' },
    { value: '10+', label: 'Years Experience' },
    { value: '24/7', label: 'Support' },
  ],
  showStats: true,
}

export default function AboutPage() {
  useSEO('about', { title: 'About Us — Sleekblue Media Houz | Nigeria Printing Company', description: 'Learn about Sleekblue Media Houz — Nigeria\'s premium printing and corporate branding company. We help brands communicate with clarity and confidence.', keywords: 'about Sleekblue, Nigerian printing company, corporate branding Lagos' })
  const [d, setD] = useState(DEFAULTS)
  const [settings, setSettings] = useState({})

  useEffect(() => {
    fetch('/api/about')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setD({
          ...DEFAULTS,
          ...data,
          values: data.values || DEFAULTS.values,
          whoWeServe: data.whoWeServe || DEFAULTS.whoWeServe,
          stats: data.stats || DEFAULTS.stats,
          team: data.team || DEFAULTS.team,
        })
      })
      .catch(() => {})
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(s => { if (s) setSettings(s) })
      .catch(() => {})
  }, [])

  const phone = settings.phone || '+234 806 527 5264'
  const whatsapp = settings.whatsapp || '2348065275264'

  return (
    <section className="bg-white min-h-screen font-sans">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#7B2FBE] to-[#5B1F9E] px-6 py-20 text-center text-white">
        <HeroCanvas />
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-8 inline-flex rounded-[28px] bg-white/90 p-4 shadow-xl">
            <img src={sleekblueLogo} alt="Sleekblue Media Houz" className="h-14" />
          </div>
          <h1 className="text-4xl font-black sm:text-5xl">{d.heroTitle}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/90">{d.heroSubtitle}</p>
        </div>
      </div>

      {d.showStats && d.stats?.length > 0 && (
        <div className="bg-[#7B2FBE] py-8">
          <div className="mx-auto flex flex-wrap justify-center gap-4 px-6 text-center text-white">
            {d.stats.map((s, i) => (
              <div key={i} className="min-w-[140px] rounded-3xl px-6 py-4">
                <p className="text-3xl font-black">{s.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.15em] text-white/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="space-y-16">
          <section className="space-y-6">
            <h2 className="text-3xl font-black text-[#7B2FBE]">{d.whoWeAreTitle}</h2>
            <p className="max-w-3xl text-base leading-8 text-slate-700">{d.whoWeAre}</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-black text-[#7B2FBE]">{d.missionTitle}</h2>
            <p className="max-w-3xl text-base leading-8 text-slate-700">{d.mission}</p>
          </section>

          {d.values?.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-3xl font-black text-[#7B2FBE]">{d.valuesTitle}</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {d.values.map((v, i) => (
                  <div key={i} className="rounded-3xl border-l-4 border-[#7B2FBE] bg-[#f9f5ff] p-6">
                    <div className="mb-3 text-3xl">{v.icon}</div>
                    <h3 className="text-base font-bold text-slate-900">{v.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{v.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {d.whoWeServe?.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-3xl font-black text-[#7B2FBE]">{d.whoWeServeTitle}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {d.whoWeServe.map((c, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-2xl bg-[#FAF3E8] p-5">
                    <span className="text-2xl text-[#7B2FBE]">✓</span>
                    <p className="text-sm font-medium text-slate-700">{c}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {d.showTeam && d.team?.length > 0 && (
            <section className="space-y-6">
              <div>
                <h2 className="text-3xl font-black text-[#7B2FBE]">{d.teamTitle}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">The people behind every premium print.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {d.team.map((member, i) => (
                  <div key={i} className="rounded-[28px] border border-[#ede8f8] bg-white p-7 text-center shadow-sm transition hover:shadow-xl">
                    {member.img ? (
                      <img src={member.img} alt={member.name} className="mx-auto mb-4 h-18 w-18 rounded-full border-4 border-[#7B2FBE] object-cover" />
                    ) : (
                      <div className="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-full bg-gradient-to-br from-[#7B2FBE] to-[#5B1F9E] text-2xl font-black text-white shadow-lg">
                        {member.initials || member.name.charAt(0)}
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7B2FBE]">{member.role}</p>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{member.bio}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-[32px] bg-[#7B2FBE] p-10 text-center text-white">
            <h2 className="text-3xl font-black">{d.ctaTitle}</h2>
            <p className="mt-4 text-base leading-7 text-white/90">{d.ctaText}</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href={`tel:${phone}`} className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#7B2FBE] transition hover:bg-white/90">
                📞 {phone}
              </a>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#25D366] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebf5a]">
                💬 Chat on WhatsApp
              </a>
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
