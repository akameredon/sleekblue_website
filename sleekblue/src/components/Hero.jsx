import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroCanvas from './HeroCanvas'
import heroSlide0 from '@assets/HERO_IMAGE_1_1779922059063.jpg'
import heroSlide1 from '@assets/HERO_SLIDE_1_1779922059065.jpg'
import heroSlide2 from '@assets/HERO_SLIDE_2_1779922059065.jpg'
import heroSlide3 from '@assets/HERO_SLIDE_3_1779922059066.jpg'

const ALL_DEFAULT_SLIDES = [heroSlide0, heroSlide1, heroSlide2, heroSlide3]
const SLIDE_INTERVAL = 5000

const BTN_STICKER = {
  background: '#FFE500',
  color: '#1a0050',
  border: 'none',
  borderRadius: '50px',
  padding: '10px 24px',
  fontSize: '14px',
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: "'HubotSans', sans-serif",
  letterSpacing: '-0.1px',
  whiteSpace: 'nowrap',
  lineHeight: 1.3,
}
const BTN_FLEX = {
  background: '#ffffff',
  color: '#1a0050',
  border: '2px solid rgba(26,0,80,0.25)',
  borderRadius: '50px',
  padding: '10px 24px',
  fontSize: '14px',
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: "'HubotSans', sans-serif",
  letterSpacing: '-0.1px',
  whiteSpace: 'nowrap',
  lineHeight: 1.3,
}

// Invisible click-target overlay for default slides that have buttons baked into the image
const BTN_INVISIBLE = {
  background: 'transparent',
  border: 'none',
  borderRadius: '50px',
  padding: '10px 24px',
  fontSize: '14px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  lineHeight: 1.3,
  color: 'transparent',
  minWidth: '110px',
  minHeight: '40px',
}

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [slides, setSlides] = useState(ALL_DEFAULT_SLIDES)
  const [heroData, setHeroData] = useState({ headline: '', subheadline: '', btn1: '', btn2: '' })
  const [usingCustom, setUsingCustom] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/hero')
      .then(r => r.ok ? r.json() : {})
      .then(d => {
        const hidden = d.hiddenDefaultSlides || []
        const customSlides = d.customSlides || []
        const extraDefaults = (d.extraDefaultSlides || []).filter(u => !(d.hiddenExtraDefaultSlides || []).includes(u))

        if (customSlides.length > 0) {
          setSlides(customSlides)
          setUsingCustom(true)
        } else {
          const visibleDefaults = ALL_DEFAULT_SLIDES.filter((_, i) => !hidden.includes(i))
          const allDefaults = [...(visibleDefaults.length > 0 ? visibleDefaults : ALL_DEFAULT_SLIDES), ...extraDefaults]
          setSlides(allDefaults)
          setUsingCustom(false)
        }

        setHeroData({
          headline:    d.headline    || '',
          subheadline: d.subheadline || '',
          btn1:        d.btn1        || '',
          btn2:        d.btn2        || '',
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % slides.length), SLIDE_INTERVAL)
    return () => clearInterval(timer)
  }, [slides.length])

  const hasText = heroData.headline || heroData.subheadline
  const btn1Label = heroData.btn1 || 'Print Sticker'
  const btn2Label = heroData.btn2 || 'Print Flex'

  return (
    <section className="relative overflow-hidden">
      {slides.map((slide, i) => (
        <div key={i} className={`${current === i ? 'block' : 'hidden'} relative`}>
          <img
            src={slide}
            alt={`Slide ${i + 1}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={i === 0 ? 'high' : 'auto'}
            className="block w-full object-cover max-h-[520px]"
          />

          {hasText && (
            <div className="absolute inset-0 bg-slate-950/40">
              <HeroCanvas />
              <div className="absolute left-5 top-10 max-w-[90%] md:left-16 md:top-28 md:max-w-[44%]">
                {heroData.headline && (
                  <h1 className="text-3xl font-black leading-tight text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:text-5xl">
                    {heroData.headline}
                  </h1>
                )}
                {heroData.subheadline && (
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-100 sm:text-base">
                    {heroData.subheadline}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/store/die-cut-stickers')}
                    className="rounded-full bg-amber-300 px-6 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-amber-400 sm:text-base"
                  >
                    {btn1Label}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/store/flex-banner')}
                    className="rounded-full border-2 border-slate-300 bg-white px-6 py-3 text-sm font-extrabold text-slate-950 transition hover:border-violet-500 hover:bg-slate-50 sm:text-base"
                  >
                    {btn2Label}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!hasText && (
            <>
              {i === 0 && (
                <h1 className="sr-only">
                  Sleekblue Media Houz — Premium Printing &amp; Corporate Branding in Nigeria
                </h1>
              )}
              {usingCustom ? (
                <>
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-slate-950/40 via-slate-950/10 to-transparent" />
                  <div className="absolute bottom-28 left-5 flex flex-wrap gap-3 z-10 md:left-16">
                    <button
                      type="button"
                      onClick={() => navigate('/store/die-cut-stickers')}
                      className="rounded-full bg-amber-300 px-6 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-amber-400 sm:text-base"
                    >
                      {btn1Label}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/store/flex-banner')}
                      className="rounded-full border-2 border-slate-300 bg-white px-6 py-3 text-sm font-extrabold text-slate-950 transition hover:border-violet-500 hover:bg-slate-50 sm:text-base"
                    >
                      {btn2Label}
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute bottom-28 left-5 flex flex-wrap gap-3 z-10 md:left-16">
                  <button onClick={() => navigate('/store/die-cut-stickers')} style={BTN_INVISIBLE} aria-label="Print Sticker" />
                  <button onClick={() => navigate('/store/flex-banner')} style={BTN_INVISIBLE} aria-label="Print Flex" />
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition ${current === i ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
