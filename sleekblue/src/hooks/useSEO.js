import { useEffect } from 'react'

let cachedSEO = null
let seoPromise = null

const DEFAULT_TITLE = 'Sleekblue Media Houz — Premium Printing. Zero Stress.'
const DEFAULT_DESC  = "Sleekblue Media Houz — Nigeria's top printing and branding company in Owerri, Imo State. Die-cut stickers, flex banners, corporate branding and more."
const DEFAULT_KW    = 'printing company Nigeria, die cut stickers Owerri, flex banner printing, corporate branding Nigeria'

function fetchSEO() {
  if (cachedSEO) return Promise.resolve(cachedSEO)
  if (seoPromise) return seoPromise
  seoPromise = fetch('/api/seo')
    .then(r => r.ok ? r.json() : {})
    .then(d => { cachedSEO = d; return d })
    .catch(() => ({}))
  return seoPromise
}

function setMeta(name, content, attr = 'name') {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el) }
  el.content = content
}

function removeMeta(name, attr = 'name') {
  const el = document.querySelector(`meta[${attr}="${name}"]`)
  if (el) el.remove()
}

function setLink(rel, href) {
  if (!href) {
    const el = document.querySelector(`link[rel="${rel}"]`)
    if (el) el.remove()
    return
  }
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el) }
  el.href = href
}

function applyMeta({ title, description, keywords, canonical, ogImage, ogType, noindex }) {
  document.title = title || DEFAULT_TITLE

  setMeta('description', description || DEFAULT_DESC)
  if (keywords) setMeta('keywords', keywords)

  setMeta('og:title',       title || DEFAULT_TITLE, 'property')
  setMeta('og:description', description || DEFAULT_DESC, 'property')
  setMeta('og:type',        ogType || 'website', 'property')
  setMeta('og:site_name',   'Sleekblue Media Houz', 'property')
  if (ogImage) setMeta('og:image', ogImage, 'property')

  setMeta('twitter:title',       title || DEFAULT_TITLE)
  setMeta('twitter:description', description || DEFAULT_DESC)
  if (ogImage) setMeta('twitter:image', ogImage)
  setMeta('twitter:card', ogImage ? 'summary_large_image' : 'summary')

  setLink('canonical', canonical || '')

  if (noindex) {
    setMeta('robots', 'noindex, nofollow')
  } else {
    removeMeta('robots')
  }
}

export function useSEO(pageKeyOrOptions, fallback = {}) {
  const isDirectOptions = typeof pageKeyOrOptions === 'object' && pageKeyOrOptions !== null

  useEffect(() => {
    if (isDirectOptions) {
      applyMeta(pageKeyOrOptions)
    } else {
      fetchSEO().then(seo => {
        const entry = seo[pageKeyOrOptions] || {}
        applyMeta({
          title:       entry.title       || fallback.title       || DEFAULT_TITLE,
          description: entry.description || fallback.description || DEFAULT_DESC,
          keywords:    entry.keywords    || fallback.keywords    || DEFAULT_KW,
          canonical:   entry.canonical   || fallback.canonical,
          ogImage:     entry.ogImage     || fallback.ogImage,
          noindex:     entry.noindex     || fallback.noindex,
        })
      })
    }
  }, [isDirectOptions ? JSON.stringify(pageKeyOrOptions) : pageKeyOrOptions])
}

export function useSEOKey(pageKey, fallback = {}) {
  return useSEO(pageKey, fallback)
}

export default useSEO
