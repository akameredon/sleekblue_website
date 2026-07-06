import { useState, useEffect } from 'react'
import Hero from '../components/Hero'
import TrustBar from '../components/TrustBar'
import BestSelling from '../components/BestSelling'
import Reviews from '../components/Reviews'
import FAQ from '../components/FAQ'
import { useSEO } from '../hooks/useSEO'

const SECTION_MAP = {
  hero:        <Hero />,
  trustBar:    <TrustBar />,
  bestSelling: <BestSelling />,
  reviews:     <Reviews />,
  faq:         <FAQ />,
}

const DEFAULT_LAYOUT = [
  { id: 'hero',        visible: true },
  { id: 'trustBar',    visible: true },
  { id: 'bestSelling', visible: true },
  { id: 'reviews',     visible: true },
  { id: 'faq',         visible: true },
]

export default function HomePage() {
  useSEO('home', {
    title: 'Sleekblue Media Houz — Premium Printing. Zero Stress.',
    description: "Nigeria's top printing and branding company. Die-cut stickers, flex banners, product labels, corporate branding — fast delivery across Nigeria.",
    keywords: 'printing company Nigeria, die cut stickers Owerri, flex banner printing, corporate branding Nigeria',
    canonical: 'https://sleekbluemediahouz.com',
  })

  const [layout, setLayout] = useState(DEFAULT_LAYOUT)

  useEffect(() => {
    fetch('/api/page-layout')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d) && d.length) setLayout(d) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/content')
      .then(r => r.ok ? r.json() : {})
      .then(content => {
        const testimonials = content.reviews?.testimonials || []
        const rated = testimonials.filter(r => r.rating > 0)
        const avg = rated.length
          ? (rated.reduce((s, r) => s + r.rating, 0) / rated.length).toFixed(1)
          : '5.0'

        const existing = document.getElementById('lb-schema')
        if (existing) existing.remove()

        const schema = {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          '@id': 'https://sleekbluemediahouz.com',
          name: 'Sleekblue Media Houz',
          description: "Nigeria's top printing and branding company in Owerri, Imo State. Die-cut stickers, flex banners, corporate branding and more.",
          url: 'https://sleekbluemediahouz.com',
          telephone: '+2348065275264',
          priceRange: '₦₦',
          image: 'https://sleekbluemediahouz.com/sleekblue-logo.jpg',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Owerri',
            addressLocality: 'Owerri',
            addressRegion: 'Imo State',
            addressCountry: 'NG',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 5.4836,
            longitude: 7.0326,
          },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              opens: '08:00',
              closes: '18:00',
            },
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: 'Saturday',
              opens: '09:00',
              closes: '16:00',
            },
          ],
          sameAs: [
            'https://www.facebook.com/sleekbluemediahouz',
            'https://www.instagram.com/sleekbluemediahouz',
          ],
          ...(rated.length > 0 ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: avg,
              reviewCount: rated.length,
              bestRating: 5,
              worstRating: 1,
            },
          } : {}),
        }

        const tag = document.createElement('script')
        tag.id = 'lb-schema'
        tag.type = 'application/ld+json'
        tag.textContent = JSON.stringify(schema)
        document.head.appendChild(tag)
      })
      .catch(() => {})

    return () => { const el = document.getElementById('lb-schema'); if (el) el.remove() }
  }, [])

  return (
    <>
      {layout
        .filter(s => s.visible !== false)
        .map(s => SECTION_MAP[s.id] ? <div key={s.id}>{SECTION_MAP[s.id]}</div> : null)
      }
    </>
  )
}
