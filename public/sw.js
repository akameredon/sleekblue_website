// Sleekblue Media Houz — Service Worker v4
// Strategy: Network-First for navigation, Cache-First for hashed assets.
// index.html is NEVER cached (always fetched from server) to prevent blank screens.
const CACHE_NAME = 'sleekblue-v4'

// Only cache the manifest — NOT the root / or index.html
const PRECACHE = ['/manifest.json']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .catch(() => {})
  )
  // Take over immediately — don't wait for old SW to die
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  // Nuke ALL old caches (any cache name that isn't current version)
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Ignore non-GET and cross-origin requests
  if (request.method !== 'GET') return
  if (url.origin !== location.origin) return

  // NEVER intercept API or upload requests — always go to network
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) return

  // NEVER cache the HTML shell, SW itself, or manifest
  if (
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === '/sw.js' ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(fetch(request))
    return
  }

  // Hashed JS/CSS/font/image assets: Cache-First (they're content-addressed)
  if (url.pathname.match(/\/assets\/[^/]+-[a-zA-Z0-9]{8,}\.(js|css|woff2?|ttf|svg|png|jpg|jpeg|webp|ico)$/)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(res => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {})
          }
          return res
        })
      })
    )
    return
  }

  // Everything else: Network-First with cache fallback
  event.respondWith(
    fetch(request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {})
        }
        return res
      })
      .catch(() => caches.match(request))
  )
})
