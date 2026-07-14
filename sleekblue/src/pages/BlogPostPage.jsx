import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'
import Breadcrumb from '../components/Breadcrumb'

const PRI = '#7B2FBE'

function readingTime(content) {
  if (!content) return 1
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

function extractTOC(html) {
  const re = /<h([23])[^>]*>(.*?)<\/h[23]>/gi
  const matches = []
  let m
  while ((m = re.exec(html)) !== null) {
    matches.push({ level: parseInt(m[1]), text: m[2].replace(/<[^>]+>/g, ''), id: `heading-${matches.length}` })
  }
  return matches
}

function renderContent(content) {
  if (!content) return ''
  let html = content
  let i = 0
  html = html.replace(/<h([23])([^>]*)>/g, (_, lv, attrs) => `<h${lv} id="heading-${i++}"${attrs}>`)
  if (!html.trim().startsWith('<')) {
    html = '<p>' + html.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>') + '</p>'
  }
  return html
}

function SocialShare({ url, title }) {
  const [copied, setCopied] = useState(false)
  const enc = encodeURIComponent

  function copy() {
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const btn = (bg, text, href, onClick) => (
    href ? (
      <a href={href} target="_blank" rel="noreferrer" className={`inline-flex items-center rounded-2xl px-4 py-3 text-xs font-semibold text-white transition ${bg}`}>
        {text}
      </a>
    ) : (
      <button type="button" onClick={onClick} className={`inline-flex items-center rounded-2xl px-4 py-3 text-xs font-semibold text-white transition ${bg}`}>
        {text}
      </button>
    )
  )

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs text-slate-500">Share:</span>
      {btn('bg-[#25D366] hover:bg-[#1ebf5a]', '💬 WhatsApp', `https://wa.me/?text=${enc(`${title}\n${url}`)}`)}
      {btn('bg-[#1877F2] hover:bg-[#165ecf]', 'Facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`)}
      {btn('bg-[#111] hover:bg-slate-800', 'X / Twitter', `https://x.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`)}
      {btn(copied ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-500 hover:bg-slate-600', copied ? '✓ Copied!' : '🔗 Copy Link', null, copy)}
    </div>
  )
}

function CommentsSection({ slug }) {
  const [comments, setComments] = useState([])
  const [form, setForm] = useState({ name: '', comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/blog/${slug}/comments`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setComments(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [slug])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.comment.trim()) { setError('Name and comment are required'); return }
    setSubmitting(true); setError('')
    try {
      const res = await fetch(`/api/blog/${slug}/comment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
      setForm({ name: '', comment: '' })
    } catch {
      setError('Failed to submit. Please try again.')
    }
    setSubmitting(false)
  }

  const fmt = ts => { try { return new Date(ts).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return '' } }

  return (
    <div className="mt-16 border-t border-slate-200 pt-10">
      <h3 className="text-xl font-bold text-slate-900">💬 Comments {comments.length > 0 && `(${comments.length})`}</h3>

      {comments.length > 0 ? (
        <div className="mt-6 space-y-4">
          {comments.map(c => (
            <div key={c.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7B2FBE] text-sm font-black text-white">{(c.name || '?')[0].toUpperCase()}</div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-500">{fmt(c.timestamp)}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-700">{c.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm italic text-slate-500">No comments yet — be the first!</p>
      )}

      {submitted ? (
        <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-700">✓ Your comment has been submitted and is awaiting moderation. Thank you!</div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Leave a comment</p>
          <input
            placeholder="Your name *"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/20"
          />
          <textarea
            placeholder="Write your comment… *"
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            rows={4}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/20 resize-vertical"
          />
          {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex rounded-2xl bg-[#7B2FBE] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6b23ba] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? '⏳ Submitting…' : '✉️ Submit Comment'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true); setPost(null); setNotFound(false); setRelatedPosts([])
    fetch(`/api/blog/${slug}`)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json() })
      .then(d => {
        setPost(d); setLoading(false)
        fetch(`/api/blog/${slug}/view`, { method: 'POST' }).catch(() => {})
        fetch('/api/blog').then(r => r.ok ? r.json() : []).then(all => {
          setRelatedPosts(all.filter(p => p.slug !== slug && p.category === d.category).slice(0, 3))
        }).catch(() => {})
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [slug])

  useSEO(post ? {
    title: `${post.title} — Sleekblue Blog`,
    description: post.excerpt || '',
    canonical: `https://sleekbluemediahouz.com/blog/${slug}`,
    ogImage: post.coverImage ? `https://sleekbluemediahouz.com${post.coverImage}` : undefined,
    ogType: 'article',
  } : 'blog')

  useEffect(() => {
    if (!post) return
    const existing = document.getElementById('article-schema')
    if (existing) existing.remove()
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt || '',
      image: post.coverImage ? [`https://sleekbluemediahouz.com${post.coverImage}`] : [],
      datePublished: post.date || new Date().toISOString(),
      dateModified: post.updatedAt || post.date || new Date().toISOString(),
      author: {
        '@type': post.authorName ? 'Person' : 'Organization',
        name: post.authorName || 'Sleekblue Media Houz',
        url: 'https://sleekbluemediahouz.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Sleekblue Media Houz',
        logo: { '@type': 'ImageObject', url: 'https://sleekbluemediahouz.com/sleekblue-logo.jpg' },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `https://sleekbluemediahouz.com/blog/${slug}` },
    }
    const tag = document.createElement('script')
    tag.id = 'article-schema'; tag.type = 'application/ld+json'; tag.textContent = JSON.stringify(schema)
    document.head.appendChild(tag)
    const bcTag = document.createElement('script')
    bcTag.id = 'blog-bc-schema'; bcTag.type = 'application/ld+json'
    bcTag.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sleekbluemediahouz.com/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://sleekbluemediahouz.com/blog' },
        { '@type': 'ListItem', position: 3, name: post.title, item: `https://sleekbluemediahouz.com/blog/${slug}` },
      ],
    })
    document.head.appendChild(bcTag)
    return () => {
      const el = document.getElementById('article-schema'); if (el) el.remove()
      const bc = document.getElementById('blog-bc-schema'); if (bc) bc.remove()
    }
  }, [post, slug])

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-9 w-9 rounded-full border-4 border-slate-200 border-t-[#7B2FBE] animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#fafafa] px-6 text-center">
      <div className="text-6xl mb-4">📄</div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Post Not Found</h2>
      <p className="text-sm text-slate-500 mb-6">This blog post doesn't exist or has been unpublished.</p>
      <button onClick={() => navigate('/blog')} className="rounded-2xl bg-[#7B2FBE] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6b23ba']">← Back to Blog</button>
    </div>
  )

  const rtMinutes = readingTime(post.content)
  const toc = extractTOC(post.content || '')
  const postUrl = typeof window !== 'undefined' ? window.location.href : `https://sleekbluemediahouz.com/blog/${slug}`
  const renderedContent = renderContent(post.content || '')

  return (
    <article className="bg-[#FAF3E8] min-h-screen px-4 py-12 sm:px-6 sm:py-16 font-sans text-slate-900">
      <div className="mx-auto max-w-5xl">
        <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: post.title }]} />

        {post.coverImage && (
          <div className="mt-8 overflow-hidden rounded-[28px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
            <img src={post.coverImage} alt={post.title} loading="lazy" decoding="async" className="w-full max-h-[420px] object-cover" />
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          {post.category && <span className="rounded-full bg-[#f5f0ff] px-3 py-1 font-semibold text-[#7B2FBE]">{post.category}</span>}
          <span>{post.date ? new Date(post.date).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
          <span>· {rtMinutes} min read</span>
          {post.viewCount > 0 && <span>· 👁 {post.viewCount} views</span>}
          {post.tags?.map(tag => (
            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">#{tag}</span>
          ))}
        </div>

        <h1 className="mt-6 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">{post.title}</h1>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7B2FBE]/10 text-xl">✍️</div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{post.authorName || 'Sleekblue Media Houz'}</p>
              {post.authorBio && <p className="text-xs text-slate-500">{post.authorBio}</p>}
            </div>
          </div>
          <SocialShare url={postUrl} title={post.title} />
        </div>

        {toc.length >= 2 && (
          <div className="mt-8 rounded-3xl border border-[#7B2FBE]/15 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7B2FBE]">📋 Table of Contents</p>
            <ol className="mt-4 space-y-2 pl-4 text-sm text-slate-600">
              {toc.map(h => (
                <li key={h.id} className={h.level === 3 ? 'ml-4' : ''}>
                  <a href={`#${h.id}`} className="text-slate-700 transition hover:text-[#7B2FBE]">{h.text}</a>
                </li>
              ))}
            </ol>
          </div>
        )}

        {post.excerpt && (
          <p className="mt-8 rounded-3xl border-l-4 border-[#7B2FBE] bg-white p-6 text-base leading-8 text-slate-700">{post.excerpt}</p>
        )}

        {post.videoUrl && (
          <div className="mt-8 overflow-hidden rounded-[28px] bg-slate-900 shadow-sm">
            {post.videoUrl.includes('youtube.com') || post.videoUrl.includes('youtu.be') ? (
              <iframe
                src={post.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                className="h-[360px] w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={post.title}
              />
            ) : (
              <video src={post.videoUrl} controls className="h-[360px] w-full" />
            )}
          </div>
        )}

        {post.audioUrl && (
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">🎙️ Listen to this article</p>
            <audio src={post.audioUrl} controls className="mt-4 w-full" />
          </div>
        )}

        {post.content && (
          <div className="blog-content mt-8 rounded-3xl bg-white p-8 shadow-sm prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: renderedContent }} />
        )}

        {post.mediaFiles?.length > 0 && (
          <div className="mt-10">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Gallery</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {post.mediaFiles.map((url, i) => (
                <div key={i} className="aspect-[4/3] overflow-hidden rounded-3xl bg-slate-200">
                  <img src={url} alt={`Media ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}

        {post.authorName && post.authorBio && (
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7B2FBE]/15 text-2xl">✍️</div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Written by {post.authorName}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{post.authorBio}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Found this helpful? Share it!</p>
          <div className="mt-4">
            <SocialShare url={postUrl} title={post.title} />
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl font-semibold text-slate-900">Related Posts</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map(rp => (
                <Link key={rp.slug} to={`/blog/${rp.slug}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  {rp.coverImage && (
                    <img src={rp.coverImage} alt={rp.title} className="h-40 w-full object-cover" loading="lazy" />
                  )}
                  <div className="p-5">
                    {rp.category && <span className="rounded-full bg-[#7B2FBE]/10 px-3 py-1 text-xs font-semibold text-[#7B2FBE]">{rp.category}</span>}
                    <p className="mt-4 text-base font-bold text-slate-900">{rp.title}</p>
                    <p className="mt-2 text-sm text-slate-500">{readingTime(rp.content)} min read</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <CommentsSection slug={slug} />

        <div className="mt-10 border-t border-slate-200 pt-6">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-[#7B2FBE] transition hover:text-[#6b23ba]">← Back to Blog</Link>
        </div>
      </div>

      <style>{`
        .blog-content h1, .blog-content h2, .blog-content h3 { color: #1a1a1a; font-family: "HubotSans", sans-serif; margin: 1.5rem 0 0.75rem; scroll-margin-top: 5rem; }
        .blog-content h2 { font-size: 1.75rem; font-weight: 800; }
        .blog-content h3 { font-size: 1.35rem; font-weight: 700; }
        .blog-content p { margin: 0 0 1.1rem; }
        .blog-content a { color: ${PRI}; }
        .blog-content img { max-width: 100%; border-radius: 1rem; margin: 1.2rem 0; }
        .blog-content ul, .blog-content ol { padding-left: 1.2rem; margin: 0 0 1.1rem; line-height: 1.8; }
        .blog-content blockquote { border-left: 0.3rem solid ${PRI}; padding: 1rem 1.2rem; margin: 1.25rem 0; background: #f9f5ff; border-radius: 0 1rem 1rem 0; color: #555; font-style: italic; }
        .blog-content pre, .blog-content code { background: #f4f4f4; padding: 0.2rem 0.5rem; border-radius: 0.4rem; font-size: 0.95rem; }
        .blog-content strong { color: #1a1a1a; }
      `}</style>
    </article>
  )
}
