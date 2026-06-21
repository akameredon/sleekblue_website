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
      <a href={href} target="_blank" rel="noreferrer"
        style={{ padding: '7px 14px', background: bg, color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', fontFamily: "'HubotSans',sans-serif", whiteSpace: 'nowrap' }}>
        {text}
      </a>
    ) : (
      <button onClick={onClick}
        style={{ padding: '7px 14px', background: bg, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'HubotSans',sans-serif", whiteSpace: 'nowrap' }}>
        {text}
      </button>
    )
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '12px', color: '#888', fontFamily: "'HubotSans',sans-serif", flexShrink: 0 }}>Share:</span>
      {btn('#25D366', '💬 WhatsApp', `https://wa.me/?text=${enc(title + '\n' + url)}`)}
      {btn('#1877F2', 'Facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`)}
      {btn('#000', 'X / Twitter', `https://x.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`)}
      {btn(copied ? '#16a34a' : '#555', copied ? '✓ Copied!' : '🔗 Copy Link', null, copy)}
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
    } catch { setError('Failed to submit. Please try again.') }
    setSubmitting(false)
  }

  const fmt = ts => { try { return new Date(ts).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return '' } }

  return (
    <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1.5px solid #e8e8e8' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a1a', marginBottom: '20px', fontFamily: "'HubotSans',sans-serif" }}>
        💬 Comments {comments.length > 0 && `(${comments.length})`}
      </h3>
      {comments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
          {comments.map(c => (
            <div key={c.id} style={{ background: '#fff', borderRadius: '12px', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: PRI, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>
                  {(c.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>{fmt(c.timestamp)}</p>
                </div>
              </div>
              <p style={{ fontSize: '13.5px', color: '#444', margin: 0, lineHeight: 1.6 }}>{c.comment}</p>
            </div>
          ))}
        </div>
      )}
      {comments.length === 0 && <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '20px', fontStyle: 'italic' }}>No comments yet — be the first!</p>}
      {submitted ? (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px 18px', color: '#16a34a', fontWeight: 600, fontSize: '13.5px' }}>
          ✓ Your comment has been submitted and is awaiting moderation. Thank you!
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 14px' }}>Leave a comment</p>
          <input placeholder="Your name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '13px', marginBottom: '10px', outline: 'none', boxSizing: 'border-box', fontFamily: "'HubotSans',sans-serif" }} />
          <textarea placeholder="Write your comment… *" value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} rows={4}
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '13px', marginBottom: '10px', outline: 'none', resize: 'vertical', fontFamily: "'HubotSans',sans-serif", boxSizing: 'border-box' }} />
          {error && <p style={{ color: '#dc2626', fontSize: '12px', margin: '0 0 10px' }}>{error}</p>}
          <button type="submit" disabled={submitting}
            style={{ background: PRI, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13.5px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, fontFamily: "'HubotSans',sans-serif" }}>
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
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '4px solid #e0d6f5', borderTopColor: PRI, animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'HubotSans', sans-serif", padding: '24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>Post Not Found</h2>
      <p style={{ color: '#888', marginBottom: '24px' }}>This blog post doesn't exist or has been unpublished.</p>
      <button onClick={() => navigate('/blog')} style={{ background: PRI, color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'HubotSans', sans-serif" }}>← Back to Blog</button>
    </div>
  )

  const rtMinutes = readingTime(post.content)
  const toc = extractTOC(post.content || '')
  const postUrl = typeof window !== 'undefined' ? window.location.href : `https://sleekbluemediahouz.com/blog/${slug}`
  const renderedContent = renderContent(post.content || '')

  return (
    <article style={{ background: '#FAF3E8', minHeight: '100vh', padding: '48px 24px 80px', fontFamily: "'HubotSans', sans-serif" }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: post.title }]} />

        {/* Cover image */}
        {post.coverImage && (
          <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
            <img src={post.coverImage} alt={post.title} style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block' }} />
          </div>
        )}

        {/* Meta bar */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          {post.category && (
            <span style={{ background: '#f5f0ff', color: PRI, padding: '4px 12px', borderRadius: '14px', fontSize: '11px', fontWeight: 700 }}>{post.category}</span>
          )}
          <span style={{ fontSize: '12px', color: '#999' }}>
            {post.date ? new Date(post.date).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
          </span>
          <span style={{ fontSize: '12px', color: '#bbb' }}>· {rtMinutes} min read</span>
          {post.viewCount > 0 && <span style={{ fontSize: '12px', color: '#bbb' }}>· 👁 {post.viewCount} views</span>}
          {post.tags?.map(tag => (
            <span key={tag} style={{ background: '#f0f0f0', color: '#666', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>#{tag}</span>
          ))}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1a1a1a', marginBottom: '16px', lineHeight: 1.25 }}>{post.title}</h1>

        {/* Author + Share row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid #e8e8e8' }}>
          {post.authorName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${PRI}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>✍️</div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{post.authorName}</p>
                {post.authorBio && <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>{post.authorBio}</p>}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>By <strong>Sleekblue Media Houz</strong></span>
            </div>
          )}
          <SocialShare url={postUrl} title={post.title} />
        </div>

        {/* Table of Contents */}
        {toc.length >= 2 && (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 22px', marginBottom: '28px', border: `1.5px solid ${PRI}20`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: '12px', fontWeight: 800, color: PRI, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📋 Table of Contents</p>
            <ol style={{ margin: 0, paddingLeft: '20px' }}>
              {toc.map(h => (
                <li key={h.id} style={{ marginBottom: '6px', marginLeft: h.level === 3 ? '16px' : 0 }}>
                  <a href={`#${h.id}`} style={{ fontSize: '14px', color: '#444', textDecoration: 'none', lineHeight: 1.5 }}
                    onMouseEnter={e => e.target.style.color = PRI} onMouseLeave={e => e.target.style.color = '#444'}>
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p style={{ fontSize: '17px', color: '#555', lineHeight: 1.7, fontWeight: 400, marginBottom: '28px', borderLeft: `4px solid ${PRI}`, paddingLeft: '16px', fontStyle: 'italic' }}>{post.excerpt}</p>
        )}

        {/* Video */}
        {post.videoUrl && (
          <div style={{ marginBottom: '28px', borderRadius: '12px', overflow: 'hidden', background: '#000', aspectRatio: '16/9' }}>
            {post.videoUrl.includes('youtube.com') || post.videoUrl.includes('youtu.be') ? (
              <iframe
                src={post.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen title={post.title}
              />
            ) : (
              <video src={post.videoUrl} controls style={{ width: '100%', maxHeight: '400px' }} />
            )}
          </div>
        )}

        {/* Audio */}
        {post.audioUrl && (
          <div style={{ marginBottom: '28px', background: '#fff', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🎙️ Listen to this article</p>
            <audio src={post.audioUrl} controls style={{ width: '100%' }} />
          </div>
        )}

        {/* Content */}
        {post.content && (
          <div className="blog-content" style={{ fontSize: '15px', color: '#333', lineHeight: 1.85, marginBottom: '28px' }}
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        )}

        {/* Media gallery */}
        {post.mediaFiles?.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gallery</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {post.mediaFiles.map((url, i) => (
                <div key={i} style={{ borderRadius: '10px', overflow: 'hidden', background: '#eee', aspectRatio: '4/3' }}>
                  <img src={url} alt={`Media ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Author bio card (if extended bio) */}
        {post.authorName && post.authorBio && (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px 24px', marginBottom: '28px', border: '1px solid #e8e8e8', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `${PRI}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>✍️</div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px' }}>Written by {post.authorName}</p>
              <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6, margin: 0 }}>{post.authorBio}</p>
            </div>
          </div>
        )}

        {/* Bottom share */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 22px', marginBottom: '32px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#888', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Found this helpful? Share it!</p>
          <SocialShare url={postUrl} title={post.title} />
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1a1a1a', marginBottom: '16px' }}>Related Posts</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {relatedPosts.map(rp => (
                <Link key={rp.slug} to={`/blog/${rp.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(123,47,190,0.13)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}>
                    {rp.coverImage && <img src={rp.coverImage} alt={rp.title} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} loading="lazy" />}
                    <div style={{ padding: '14px' }}>
                      {rp.category && <span style={{ fontSize: '10px', fontWeight: 700, color: PRI, background: `${PRI}12`, padding: '2px 8px', borderRadius: '10px' }}>{rp.category}</span>}
                      <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#1a1a1a', margin: '8px 0 4px', lineHeight: 1.35 }}>{rp.title}</p>
                      <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>{readingTime(rp.content)} min read</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <CommentsSection slug={slug} />

        {/* Back */}
        <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: '24px' }}>
          <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: PRI, fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>
            ← Back to Blog
          </Link>
        </div>
      </div>

      <style>{`
        .blog-content h1,.blog-content h2,.blog-content h3 { color:#1a1a1a; font-family:"HubotSans",sans-serif; margin:28px 0 12px; scroll-margin-top:80px; }
        .blog-content h2 { font-size:22px; font-weight:800; }
        .blog-content h3 { font-size:18px; font-weight:700; }
        .blog-content p { margin:0 0 18px; }
        .blog-content a { color:${PRI}; }
        .blog-content img { max-width:100%; border-radius:10px; margin:16px 0; }
        .blog-content ul,.blog-content ol { padding-left:22px; margin:0 0 18px; line-height:1.8; }
        .blog-content blockquote { border-left:4px solid ${PRI}; padding:12px 16px; margin:20px 0; background:#f9f5ff; border-radius:0 8px 8px 0; color:#555; font-style:italic; }
        .blog-content pre,.blog-content code { background:#f4f4f4; padding:2px 6px; border-radius:4px; font-size:13px; }
        .blog-content strong { color:#1a1a1a; }
      `}</style>
    </article>
  )
}
