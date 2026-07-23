/**
 * Sleekblue Media Houz — Express API Server
 * Serves the React frontend (dist/) and all /api/* routes.
 * Uses file-based JSON storage (site-data.json + runtime/*.json).
 */

import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── Config ──────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3000', 10)
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn('[WARN] JWT_SECRET not set — using insecure fallback. Set it in Replit Secrets!')
  return 'sleekblue-dev-secret-change-me-in-production'
})()
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

// ─── Paths ───────────────────────────────────────────────────────────────────
const DATA_FILE = path.join(__dirname, 'site-data.json')
const RUNTIME_DIR = path.join(__dirname, 'runtime')
const UPLOADS_DIR = path.join(__dirname, 'uploads')
const DIST_DIR = path.join(__dirname, 'dist')

// Ensure directories exist
for (const dir of [RUNTIME_DIR, UPLOADS_DIR,
  path.join(UPLOADS_DIR, 'hero'),
  path.join(UPLOADS_DIR, 'products'),
  path.join(UPLOADS_DIR, 'variants'),
  path.join(UPLOADS_DIR, 'stickers'),
  path.join(UPLOADS_DIR, 'blog'),
  path.join(UPLOADS_DIR, 'artwork'),
  path.join(UPLOADS_DIR, 'brand'),
]) {
  fs.mkdirSync(dir, { recursive: true })
}

// ─── File-based DB ────────────────────────────────────────────────────────────
function readJson(filePath, defaultVal = {}) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return typeof defaultVal === 'function' ? defaultVal() : structuredClone(defaultVal)
  }
}
function writeJson(filePath, data) {
  const tmp = filePath + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
  fs.renameSync(tmp, filePath)
}

const runtimePath = (name) => path.join(RUNTIME_DIR, `${name}.json`)

// Site data helpers
function getSiteData() { return readJson(DATA_FILE, {}) }
function patchSiteData(patch) {
  const data = getSiteData()
  const merged = deepMerge(data, patch)
  writeJson(DATA_FILE, merged)
  return merged
}
function deepMerge(target, source) {
  const out = { ...target }
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) {
      out[k] = deepMerge(target[k], v)
    } else {
      out[k] = v
    }
  }
  return out
}

// Runtime data helpers
function getRuntimeData(name, defaultVal = []) {
  return readJson(runtimePath(name), defaultVal)
}
function setRuntimeData(name, data) {
  writeJson(runtimePath(name), data)
}

// ─── Admin Config ─────────────────────────────────────────────────────────────
const ADMIN_CONFIG_PATH = runtimePath('admin-config')
function getAdminConfig() {
  const cfg = readJson(ADMIN_CONFIG_PATH, null)
  if (cfg) return cfg
  // First run: hash the env password
  const hash = bcrypt.hashSync(ADMIN_PASSWORD, 10)
  const newCfg = { username: ADMIN_USERNAME, passwordHash: hash }
  writeJson(ADMIN_CONFIG_PATH, newCfg)
  return newCfg
}

// ─── Activity Log ─────────────────────────────────────────────────────────────
function logActivity(action, detail = '') {
  const log = getRuntimeData('activity-log', [])
  log.unshift({ ts: Date.now(), action, detail })
  if (log.length > 500) log.splice(500)
  setRuntimeData('activity-log', log)
}

// ─── Express App ──────────────────────────────────────────────────────────────
const app = express()

app.set('trust proxy', 1)

// Security headers (relax CSP for dev; tighten for prod)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))
app.use(compression())

// Rate limiting
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }))
app.use('/api/admin/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many login attempts' } }))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(UPLOADS_DIR))
// Serve attached assets
app.use('/assets', express.static(path.join(__dirname, 'attached_assets')))

// ─── JWT Auth Middleware ───────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.admin = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// ─── Multer ───────────────────────────────────────────────────────────────────
function makeUploader(subdir, fieldName = 'file') {
  const storage = multer.diskStorage({
    destination: path.join(UPLOADS_DIR, subdir),
    filename: (_, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg'
      cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`)
    },
  })
  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_, file, cb) => {
      const ok = /image\/(jpeg|png|gif|webp|svg\+xml)/.test(file.mimetype)
      cb(ok ? null : new Error('Only image files are allowed'), ok)
    },
  }).single(fieldName)
}

const heroUploader = makeUploader('hero')
const productUploader = makeUploader('products')
const variantUploader = makeUploader('variants')
const stickerUploader = makeUploader('stickers')
const blogUploader = makeUploader('blog')
const artworkUploader = makeUploader('artwork')
const brandUploader = makeUploader('brand')

function uploadMiddleware(uploader) {
  return (req, res, next) => {
    uploader(req, res, (err) => {
      if (err) return res.status(400).json({ ok: false, error: err.message })
      next()
    })
  }
}

// ─── Public API Routes ────────────────────────────────────────────────────────

// Settings (GA4, Meta Pixel, WhatsApp, etc.)
app.get('/api/settings', (_, res) => {
  const d = getSiteData()
  res.json(d.settings || {})
})

// Page layout
app.get('/api/page-layout', (_, res) => {
  const d = getSiteData()
  res.json(d.pageLayout || {})
})

// Hero
app.get('/api/hero', (_, res) => {
  const d = getSiteData()
  res.json(d.hero || {})
})

// Content (reviews, trustBar, footer, FAQ, bestSelling)
app.get('/api/content', (_, res) => {
  const d = getSiteData()
  res.json(d.content || {})
})

// SEO metadata
app.get('/api/seo', (_, res) => {
  const d = getSiteData()
  res.json(d.seo || {})
})

// Promo banner
app.get('/api/promo-banner', (_, res) => {
  const d = getSiteData()
  res.json(d.promoBanner || null)
})

// About page
app.get('/api/about', (_, res) => {
  const d = getSiteData()
  res.json(d.about || {})
})

// Product overrides
app.get('/api/products/:slug', (req, res) => {
  const d = getSiteData()
  const overrides = (d.productOverrides || {})[req.params.slug] || null
  res.json(overrides)
})

// Product view stats (stub — returns 0)
app.get('/api/product/views/:slug', (req, res) => {
  const analytics = getRuntimeData('analytics', [])
  const slug = req.params.slug
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  const views7d = analytics.filter(e => e.type === 'product_view' && e.slug === slug && e.ts > cutoff).length
  res.json({ views7d })
})

// Custom product images
app.get('/api/product-images', (_, res) => {
  const d = getSiteData()
  res.json(d.productImages || {})
})

// Variant images
app.get('/api/product-variant-images', (_, res) => {
  const d = getSiteData()
  res.json(d.variantImages || {})
})

// Sticker size images
app.get('/api/sticker-images', (_, res) => {
  const d = getSiteData()
  res.json(d.stickerImages || {})
})

// Blog posts (public — only approved)
app.get('/api/blog', (_, res) => {
  const d = getSiteData()
  const posts = (d.blogPosts || []).filter(p => p.published !== false)
  res.json(posts)
})

app.get('/api/blog/:slug', (req, res) => {
  const d = getSiteData()
  const post = (d.blogPosts || []).find(p => p.slug === req.params.slug)
  if (!post) return res.status(404).json({ error: 'Not found' })
  res.json(post)
})

app.post('/api/blog/:slug/view', (req, res) => {
  const d = getSiteData()
  const posts = d.blogPosts || []
  const idx = posts.findIndex(p => p.slug === req.params.slug)
  if (idx >= 0) {
    posts[idx].views = (posts[idx].views || 0) + 1
    patchSiteData({ blogPosts: posts })
  }
  res.json({ ok: true })
})

app.get('/api/blog/:slug/comments', (req, res) => {
  const comments = getRuntimeData('comments', [])
  const approved = comments.filter(c => c.slug === req.params.slug && c.approved)
  res.json(approved)
})

app.post('/api/blog/:slug/comment', (req, res) => {
  const { name, comment } = req.body
  if (!name || !comment) return res.status(400).json({ error: 'Name and comment required' })
  const comments = getRuntimeData('comments', [])
  const entry = { id: `CMT-${Date.now()}`, slug: req.params.slug, name, comment, ts: Date.now(), approved: false }
  comments.unshift(entry)
  setRuntimeData('comments', comments)
  res.json({ ok: true })
})

// Newsletter subscribe
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })
  const subs = getRuntimeData('newsletter', [])
  if (!subs.find(s => s.email === email)) {
    subs.push({ id: `NL-${Date.now()}`, email, ts: Date.now() })
    setRuntimeData('newsletter', subs)
  }
  res.json({ ok: true })
})

// WhatsApp lead
app.post('/api/subscribe-whatsapp', (req, res) => {
  const { name, phone } = req.body
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' })
  const leads = getRuntimeData('leads', [])
  leads.unshift({
    id: `LEAD-${Date.now()}`,
    name, phone,
    source: 'whatsapp-popup',
    ts: Date.now(),
    followedUp: false,
  })
  setRuntimeData('leads', leads)
  res.json({ ok: true })
})

// Review submit
app.post('/api/reviews/submit', (req, res) => {
  const { name, text, rating, date } = req.body
  if (!name || !text) return res.status(400).json({ error: 'Name and review required' })
  const reviews = getRuntimeData('pending-reviews', [])
  reviews.unshift({ id: `REV-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`, name, text, rating: rating || 5, date: date || new Date().toISOString(), approved: false, visible: false })
  setRuntimeData('pending-reviews', reviews)
  res.json({ ok: true })
})

// Analytics track
app.post('/api/analytics/track', (req, res) => {
  const analytics = getRuntimeData('analytics', [])
  analytics.unshift({ ...req.body, ts: Date.now(), ip: req.ip })
  if (analytics.length > 10000) analytics.splice(10000)
  setRuntimeData('analytics', analytics)
  res.json({ ok: true })
})

// Artwork upload
app.post('/api/upload/artwork', uploadMiddleware(artworkUploader), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'No file' })
  res.json({ ok: true, url: `/uploads/artwork/${req.file.filename}` })
})

// Referral generate (public)
app.post('/api/referral/generate', (req, res) => {
  const { name, phone, email, source } = req.body
  const code = `SB-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
  const referrals = getRuntimeData('referrals', [])
  referrals.unshift({ id: `REF-${Date.now()}`, code, name, phone, email, source, ts: Date.now() })
  setRuntimeData('referrals', referrals)
  res.json({ ok: true, code })
})

// ─── Admin Auth ────────────────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body
  const cfg = getAdminConfig()
  if (username !== cfg.username) {
    logActivity('login_failed', `username: ${username}`)
    return res.status(401).json({ ok: false, error: 'Invalid credentials' })
  }
  const valid = bcrypt.compareSync(password, cfg.passwordHash)
  if (!valid) {
    logActivity('login_failed', `username: ${username}`)
    return res.status(401).json({ ok: false, error: 'Invalid credentials' })
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' })
  logActivity('login', `username: ${username}`)
  res.json({ ok: true, token })
})

app.put('/api/admin/password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body
  const cfg = getAdminConfig()
  if (!bcrypt.compareSync(currentPassword, cfg.passwordHash)) {
    return res.status(400).json({ ok: false, error: 'Current password incorrect' })
  }
  cfg.passwordHash = bcrypt.hashSync(newPassword, 10)
  writeJson(ADMIN_CONFIG_PATH, cfg)
  logActivity('password_changed')
  res.json({ ok: true })
})

// ─── Admin — Aggregated Site Data ─────────────────────────────────────────────
app.get('/api/admin/site-data', requireAuth, (_, res) => {
  const d = getSiteData()
  const leads = getRuntimeData('leads', [])
  const newsletter = getRuntimeData('newsletter', [])
  const reviews = getRuntimeData('pending-reviews', [])
  res.json({ ...d, leads, newsletter, reviews })
})

// ─── Admin — Settings ─────────────────────────────────────────────────────────
app.put('/api/admin/settings', requireAuth, (req, res) => {
  patchSiteData({ settings: req.body })
  logActivity('settings_updated')
  res.json({ ok: true })
})

// ─── Admin — SEO ──────────────────────────────────────────────────────────────
app.put('/api/admin/seo', requireAuth, (req, res) => {
  patchSiteData({ seo: req.body })
  logActivity('seo_updated')
  res.json({ ok: true })
})

// ─── Admin — Page Layout ──────────────────────────────────────────────────────
app.put('/api/admin/page-layout', requireAuth, (req, res) => {
  patchSiteData({ pageLayout: req.body })
  logActivity('page_layout_updated')
  res.json({ ok: true })
})

// ─── Admin — Hero ─────────────────────────────────────────────────────────────
app.put('/api/admin/hero', requireAuth, (req, res) => {
  const d = getSiteData()
  const hero = { ...(d.hero || {}), ...req.body }
  patchSiteData({ hero })
  logActivity('hero_updated')
  res.json({ ok: true })
})

app.put('/api/admin/hero/default-slides', requireAuth, (req, res) => {
  const d = getSiteData()
  const hero = { ...(d.hero || {}), hiddenDefaultSlides: req.body.hiddenDefaultSlides || [] }
  patchSiteData({ hero })
  res.json({ ok: true })
})

app.put('/api/admin/hero/extra-default-visibility', requireAuth, (req, res) => {
  const d = getSiteData()
  const hero = { ...(d.hero || {}), hiddenExtraDefaultSlides: req.body.hiddenExtraDefaultSlides || [] }
  patchSiteData({ hero })
  res.json({ ok: true })
})

// Hero image uploads
app.post('/api/admin/upload/hero', requireAuth, uploadMiddleware(heroUploader), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'No file' })
  const url = `/uploads/hero/${req.file.filename}`
  const d = getSiteData()
  const hero = d.hero || {}
  const customSlides = [...(hero.customSlides || []), { url, label: req.body.label || '' }]
  patchSiteData({ hero: { ...hero, customSlides } })
  logActivity('hero_image_uploaded', url)
  res.json({ ok: true, url })
})

app.delete('/api/admin/upload/hero', requireAuth, (req, res) => {
  const { url } = req.body
  const d = getSiteData()
  const hero = d.hero || {}
  const customSlides = (hero.customSlides || []).filter(s => s.url !== url)
  patchSiteData({ hero: { ...hero, customSlides } })
  // Try to delete file
  tryDeleteUpload(url)
  logActivity('hero_image_deleted', url)
  res.json({ ok: true })
})

app.put('/api/admin/upload/hero/reorder', requireAuth, (req, res) => {
  const { slides } = req.body
  const d = getSiteData()
  patchSiteData({ hero: { ...(d.hero || {}), customSlides: slides } })
  res.json({ ok: true })
})

// Extra default slides
app.post('/api/admin/upload/hero/extra-default', requireAuth, uploadMiddleware(heroUploader), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'No file' })
  const url = `/uploads/hero/${req.file.filename}`
  const d = getSiteData()
  const hero = d.hero || {}
  const extraDefaultSlides = [...(hero.extraDefaultSlides || []), url]
  patchSiteData({ hero: { ...hero, extraDefaultSlides } })
  res.json({ ok: true, url })
})

app.delete('/api/admin/upload/hero/extra-default', requireAuth, (req, res) => {
  const { url } = req.body
  const d = getSiteData()
  const hero = d.hero || {}
  const extraDefaultSlides = (hero.extraDefaultSlides || []).filter(u => u !== url)
  patchSiteData({ hero: { ...hero, extraDefaultSlides } })
  tryDeleteUpload(url)
  res.json({ ok: true })
})

// ─── Admin — Products ─────────────────────────────────────────────────────────
app.put('/api/admin/products/:slug', requireAuth, (req, res) => {
  const d = getSiteData()
  const overrides = d.productOverrides || {}
  overrides[req.params.slug] = { ...(overrides[req.params.slug] || {}), ...req.body }
  patchSiteData({ productOverrides: overrides })
  logActivity('product_updated', req.params.slug)
  res.json({ ok: true })
})

app.delete('/api/admin/products/:slug', requireAuth, (req, res) => {
  const d = getSiteData()
  const overrides = d.productOverrides || {}
  delete overrides[req.params.slug]
  writeJson(DATA_FILE, { ...d, productOverrides: overrides })
  logActivity('product_override_deleted', req.params.slug)
  res.json({ ok: true })
})

// ─── Admin — Product Image Uploads ────────────────────────────────────────────
app.post('/api/admin/upload/product/:slug', requireAuth, uploadMiddleware(productUploader), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'No file' })
  const url = `/uploads/products/${req.file.filename}`
  const d = getSiteData()
  const productImages = d.productImages || {}
  productImages[req.params.slug] = [...(productImages[req.params.slug] || []), url]
  patchSiteData({ productImages })
  logActivity('product_image_uploaded', req.params.slug)
  res.json({ ok: true, url })
})

app.delete('/api/admin/upload/product/:slug', requireAuth, (req, res) => {
  const { url } = req.body
  const d = getSiteData()
  const productImages = d.productImages || {}
  productImages[req.params.slug] = (productImages[req.params.slug] || []).filter(u => u !== url)
  patchSiteData({ productImages })
  tryDeleteUpload(url)
  res.json({ ok: true })
})

// ─── Admin — Variant Image Uploads ────────────────────────────────────────────
app.post('/api/admin/upload/product-variant/:slug', requireAuth, uploadMiddleware(variantUploader), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'No file' })
  const url = `/uploads/variants/${req.file.filename}`
  const variant = req.body.variant || 'default'
  const d = getSiteData()
  const variantImages = d.variantImages || {}
  const key = `${req.params.slug}::${variant}`
  variantImages[key] = [...(variantImages[key] || []), url]
  patchSiteData({ variantImages })
  res.json({ ok: true, url })
})

app.delete('/api/admin/upload/product-variant/:slug', requireAuth, (req, res) => {
  const { url, variant = 'default' } = req.body
  const d = getSiteData()
  const variantImages = d.variantImages || {}
  const key = `${req.params.slug}::${variant}`
  variantImages[key] = (variantImages[key] || []).filter(u => u !== url)
  patchSiteData({ variantImages })
  tryDeleteUpload(url)
  res.json({ ok: true })
})

// ─── Admin — Sticker Images & Prices ─────────────────────────────────────────
app.post('/api/admin/upload/sticker-image', requireAuth, uploadMiddleware(stickerUploader), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'No file' })
  const url = `/uploads/stickers/${req.file.filename}`
  const size = req.body.size || 'unknown'
  const d = getSiteData()
  const stickerImages = d.stickerImages || {}
  stickerImages[size] = [...(stickerImages[size] || []), url]
  patchSiteData({ stickerImages })
  res.json({ ok: true, url })
})

app.delete('/api/admin/sticker-image', requireAuth, (req, res) => {
  const { size, url } = req.body
  const d = getSiteData()
  const stickerImages = d.stickerImages || {}
  stickerImages[size] = (stickerImages[size] || []).filter(u => u !== url)
  patchSiteData({ stickerImages })
  tryDeleteUpload(url)
  res.json({ ok: true })
})

app.put('/api/admin/sticker-prices', requireAuth, (req, res) => {
  patchSiteData({ stickerPriceOverrides: req.body })
  logActivity('sticker_prices_updated')
  res.json({ ok: true })
})

// ─── Admin — Content (TrustBar, Reviews, Footer, FAQ, BestSelling) ────────────
app.get('/api/admin/reviews', requireAuth, (_, res) => {
  const pending = getRuntimeData('pending-reviews', [])
  res.json(pending)
})

app.patch('/api/admin/reviews/:id/approve', requireAuth, (req, res) => {
  const pending = getRuntimeData('pending-reviews', [])
  const idx = pending.findIndex(r => r.id === req.params.id)
  if (idx < 0) return res.status(404).json({ error: 'Not found' })
  pending[idx].approved = true
  pending[idx].visible = true
  // Also add to site-data reviews
  const d = getSiteData()
  const content = d.content || {}
  const reviews = content.reviews || {}
  const testimonials = [...(reviews.testimonials || []), { ...pending[idx] }]
  patchSiteData({ content: { ...content, reviews: { ...reviews, testimonials } } })
  setRuntimeData('pending-reviews', pending)
  logActivity('review_approved', req.params.id)
  res.json({ ok: true })
})

app.delete('/api/admin/reviews/:id', requireAuth, (req, res) => {
  const pending = getRuntimeData('pending-reviews', [])
  setRuntimeData('pending-reviews', pending.filter(r => r.id !== req.params.id))
  res.json({ ok: true })
})

app.put('/api/admin/content', requireAuth, (req, res) => {
  const d = getSiteData()
  const content = deepMerge(d.content || {}, req.body)
  patchSiteData({ content })
  logActivity('content_updated')
  res.json({ ok: true })
})

app.put('/api/admin/faq', requireAuth, (req, res) => {
  const d = getSiteData()
  const content = { ...(d.content || {}), faq: req.body.faq }
  patchSiteData({ content })
  logActivity('faq_updated')
  res.json({ ok: true })
})

// Promo banner
app.put('/api/admin/promo-banner', requireAuth, (req, res) => {
  patchSiteData({ promoBanner: req.body })
  logActivity('promo_banner_updated')
  res.json({ ok: true })
})

// ─── Admin — About ─────────────────────────────────────────────────────────────
app.put('/api/admin/about', requireAuth, (req, res) => {
  patchSiteData({ about: req.body })
  logActivity('about_updated')
  res.json({ ok: true })
})

// ─── Admin — Blog ──────────────────────────────────────────────────────────────
app.get('/api/admin/blog', requireAuth, (_, res) => {
  const d = getSiteData()
  res.json(d.blogPosts || [])
})

app.post('/api/admin/blog', requireAuth, (req, res) => {
  const d = getSiteData()
  const posts = d.blogPosts || []
  const post = {
    id: `POST-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0,
  }
  posts.unshift(post)
  patchSiteData({ blogPosts: posts })
  logActivity('blog_post_created', post.title)
  res.json({ ok: true, post })
})

app.put('/api/admin/blog/:id', requireAuth, (req, res) => {
  const d = getSiteData()
  const posts = d.blogPosts || []
  const idx = posts.findIndex(p => p.id === req.params.id)
  if (idx < 0) return res.status(404).json({ error: 'Not found' })
  posts[idx] = { ...posts[idx], ...req.body, updatedAt: new Date().toISOString() }
  patchSiteData({ blogPosts: posts })
  logActivity('blog_post_updated', posts[idx].title)
  res.json({ ok: true })
})

app.delete('/api/admin/blog/:id', requireAuth, (req, res) => {
  const d = getSiteData()
  const posts = (d.blogPosts || []).filter(p => p.id !== req.params.id)
  patchSiteData({ blogPosts: posts })
  logActivity('blog_post_deleted', req.params.id)
  res.json({ ok: true })
})

app.put('/api/admin/blog/reorder', requireAuth, (req, res) => {
  patchSiteData({ blogPosts: req.body.posts })
  res.json({ ok: true })
})

app.post('/api/admin/upload/blog', requireAuth, uploadMiddleware(blogUploader), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'No file' })
  res.json({ ok: true, url: `/uploads/blog/${req.file.filename}` })
})

// ─── Admin — Brand Logo Upload ─────────────────────────────────────────────────
app.post('/api/admin/upload/brand-logo', requireAuth, uploadMiddleware(brandUploader), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'No file' })
  const url = `/uploads/brand/${req.file.filename}`
  patchSiteData({ brandLogo: url })
  logActivity('brand_logo_uploaded', url)
  res.json({ ok: true, url })
})

// ─── Admin — Leads ─────────────────────────────────────────────────────────────
app.get('/api/admin/leads', requireAuth, (_, res) => {
  res.json(getRuntimeData('leads', []))
})

app.delete('/api/admin/leads/:id', requireAuth, (req, res) => {
  const leads = getRuntimeData('leads', []).filter(l => l.id !== req.params.id)
  setRuntimeData('leads', leads)
  res.json({ ok: true })
})

app.patch('/api/admin/leads/:id/follow-up', requireAuth, (req, res) => {
  const leads = getRuntimeData('leads', [])
  const idx = leads.findIndex(l => l.id === req.params.id)
  if (idx < 0) return res.status(404).json({ error: 'Not found' })
  leads[idx].followedUp = !leads[idx].followedUp
  leads[idx].followedUpAt = leads[idx].followedUp ? Date.now() : null
  setRuntimeData('leads', leads)
  logActivity('lead_follow_up', req.params.id)
  res.json({ ok: true, followedUp: leads[idx].followedUp })
})

// ─── Admin — Newsletter ────────────────────────────────────────────────────────
app.get('/api/admin/newsletter', requireAuth, (_, res) => {
  res.json(getRuntimeData('newsletter', []))
})

app.delete('/api/admin/newsletter/:id', requireAuth, (req, res) => {
  const subs = getRuntimeData('newsletter', []).filter(s => s.id !== req.params.id)
  setRuntimeData('newsletter', subs)
  res.json({ ok: true })
})

// ─── Admin — Comments ──────────────────────────────────────────────────────────
app.get('/api/admin/comments', requireAuth, (_, res) => {
  res.json(getRuntimeData('comments', []))
})

app.patch('/api/admin/comments/:id/approve', requireAuth, (req, res) => {
  const comments = getRuntimeData('comments', [])
  const idx = comments.findIndex(c => c.id === req.params.id)
  if (idx >= 0) { comments[idx].approved = true; setRuntimeData('comments', comments) }
  res.json({ ok: true })
})

app.delete('/api/admin/comments/:id', requireAuth, (req, res) => {
  setRuntimeData('comments', getRuntimeData('comments', []).filter(c => c.id !== req.params.id))
  res.json({ ok: true })
})

// ─── Admin — Referrals ────────────────────────────────────────────────────────
app.get('/api/admin/referrals', requireAuth, (_, res) => {
  res.json(getRuntimeData('referrals', []))
})

app.delete('/api/admin/referrals/:id', requireAuth, (req, res) => {
  setRuntimeData('referrals', getRuntimeData('referrals', []).filter(r => r.id !== req.params.id))
  res.json({ ok: true })
})

// ─── Admin — Analytics ────────────────────────────────────────────────────────
app.get('/api/admin/analytics', requireAuth, (_, res) => {
  const analytics = getRuntimeData('analytics', [])
  const security = analytics.filter(e => e.type === 'security_event')
  res.json({ events: analytics.slice(0, 200), security })
})

app.delete('/api/admin/analytics/clear', requireAuth, (_, res) => {
  setRuntimeData('analytics', [])
  logActivity('analytics_cleared')
  res.json({ ok: true })
})

// ─── Admin — Growth ────────────────────────────────────────────────────────────
app.get('/api/admin/growth', requireAuth, (_, res) => {
  const analytics = getRuntimeData('analytics', [])
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  // Daily page views (last 30 days)
  const daily = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date(now - i * day)
    daily[d.toISOString().slice(0, 10)] = 0
  }
  analytics.filter(e => e.type === 'page_view' && e.ts > now - 30 * day).forEach(e => {
    const key = new Date(e.ts).toISOString().slice(0, 10)
    if (key in daily) daily[key]++
  })

  // Top pages
  const pageCounts = {}
  analytics.filter(e => e.type === 'page_view').forEach(e => {
    if (e.page) pageCounts[e.page] = (pageCounts[e.page] || 0) + 1
  })
  const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([page, count]) => ({ page, count }))

  // Top products
  const productCounts = {}
  analytics.filter(e => e.type === 'product_view').forEach(e => {
    if (e.slug) productCounts[e.slug] = (productCounts[e.slug] || 0) + 1
  })
  const topProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([slug, count]) => ({ slug, count }))

  // Device breakdown
  const devices = {}
  analytics.forEach(e => {
    if (e.device) devices[e.device] = (devices[e.device] || 0) + 1
  })

  res.json({ daily: Object.entries(daily).sort((a, b) => a[0].localeCompare(b[0])).map(([date, views]) => ({ date, views })), topPages, topProducts, devices })
})

// ─── Admin — Activity Log ─────────────────────────────────────────────────────
app.get('/api/admin/activity-log', requireAuth, (_, res) => {
  res.json(getRuntimeData('activity-log', []))
})

// ─── Admin — T&C Acceptances ─────────────────────────────────────────────────
app.get('/api/admin/acceptances', requireAuth, (_, res) => {
  res.json(getRuntimeData('acceptances', []))
})

// Log T&C acceptance (public)
app.post('/api/terms/accept', (req, res) => {
  const acceptances = getRuntimeData('acceptances', [])
  acceptances.unshift({ ts: Date.now(), ip: req.ip, ua: req.headers['user-agent'] })
  if (acceptances.length > 5000) acceptances.splice(5000)
  setRuntimeData('acceptances', acceptances)
  res.json({ ok: true })
})

// ─── Admin — SEO Audit ────────────────────────────────────────────────────────
app.get('/api/admin/seo-audit', requireAuth, (_, res) => {
  const d = getSiteData()
  const seo = d.seo || {}
  const issues = []
  const posts = d.blogPosts || []
  posts.forEach(p => {
    if (!p.metaTitle) issues.push({ type: 'missing_meta_title', slug: p.slug })
    if (!p.metaDesc) issues.push({ type: 'missing_meta_desc', slug: p.slug })
  })
  res.json({ seo, issues, postCount: posts.length })
})

// ─── Admin — Backup ────────────────────────────────────────────────────────────
app.get('/api/admin/backup', requireAuth, (_, res) => {
  const siteData = getSiteData()
  const backup = {
    exportedAt: new Date().toISOString(),
    siteData,
    leads: getRuntimeData('leads', []),
    newsletter: getRuntimeData('newsletter', []),
    reviews: getRuntimeData('pending-reviews', []),
    comments: getRuntimeData('comments', []),
    referrals: getRuntimeData('referrals', []),
    analytics: getRuntimeData('analytics', []),
    activityLog: getRuntimeData('activity-log', []),
  }
  logActivity('backup_downloaded')
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', `attachment; filename="sleekblue-backup-${Date.now()}.json"`)
  res.json(backup)
})

// ─── Util ──────────────────────────────────────────────────────────────────────
function tryDeleteUpload(url) {
  try {
    if (url && url.startsWith('/uploads/')) {
      fs.unlinkSync(path.join(__dirname, url))
    }
  } catch { /* ignore */ }
}

// ─── Serve Frontend ────────────────────────────────────────────────────────────
const distExists = fs.existsSync(DIST_DIR)
if (distExists) {
  app.use(express.static(DIST_DIR, { maxAge: '1d', etag: true }))
  // SPA fallback (Express 5 compatible — use middleware, not a wildcard route)
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    res.sendFile(path.join(DIST_DIR, 'index.html'))
  })
} else {
  app.get('/', (_, res) => res.json({
    status: 'API running',
    note: 'Frontend not built yet. Run: npm run build',
    docs: 'API available at /api/*',
  }))
}

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Sleekblue API] Running on http://0.0.0.0:${PORT}`)
  console.log(`[Sleekblue API] NODE_ENV=${process.env.NODE_ENV || 'development'}`)
  console.log(`[Sleekblue API] Admin username: ${ADMIN_USERNAME}`)
  if (!process.env.JWT_SECRET) console.warn('[Sleekblue API] ⚠ JWT_SECRET not set in environment!')
  if (!process.env.ADMIN_PASSWORD) console.warn('[Sleekblue API] ⚠ ADMIN_PASSWORD not set in environment!')
})
