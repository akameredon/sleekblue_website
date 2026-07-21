import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useSEO from '../hooks/useSEO'
import Breadcrumb from '../components/Breadcrumb'
import { BlogPostSkeleton } from '../components/SkeletonCard'

const PRI = '#7B2FBE'
const POSTS_PER_PAGE = 9

function readingTime(content) {
  if (!content) return 1
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export default function BlogPage() {
  useSEO('blog', {
    title: 'Blog — Printing Tips & Business Ideas | Sleekblue',
    description: 'Read expert tips on branding, printing, and growing your business from the Sleekblue Media Houz team.',
    canonical: 'https://sleekbluemediahouz.com/blog',
  })

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeTag, setActiveTag] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/blog')
      .then(r => (r.ok ? r.json() : []))
      .then(d => { setPosts(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const categories = useMemo(() => ['All', ...new Set(posts.map(p => p.category).filter(Boolean))], [posts])

  const allTags = useMemo(() => {
    const tagMap = {}
    posts.forEach(p => (p.tags || []).forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1 }))
    return Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 20)
  }, [posts])

  const popularPosts = useMemo(
    () => [...posts].filter(p => p.viewCount > 0).sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5),
    [posts]
  )

  const filtered = useMemo(() => {
    let out = posts
    if (activeCategory !== 'All') out = out.filter(p => p.category === activeCategory)
    if (activeTag) out = out.filter(p => (p.tags || []).includes(activeTag))
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      out = out.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.excerpt || '').toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      )
    }
    return out
  }, [posts, activeCategory, activeTag, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE))
  const pagePosts = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  function changeCategory(cat) { setActiveCategory(cat); setActiveTag(null); setPage(1) }
  function changeTag(tag) { setActiveTag(t => t === tag ? null : tag); setActiveCategory('All'); setPage(1) }
  function changeSearch(val) { setSearch(val); setPage(1) }

  return (
    <section className="bg-[#FAF3E8] min-h-screen px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />

        <div className="mt-10 flex flex-col gap-6 rounded-[28px] bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Blog</h1>
            <p className="mt-2 text-sm text-slate-500">Tips, guides and insights from the Sleekblue team</p>
          </div>
          <div className="relative w-full max-w-sm">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">🔍</span>
            <input
              type="search"
              value={search}
              onChange={e => changeSearch(e.target.value)}
              placeholder="Search posts…"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/20"
            />
          </div>
        </div>

        {categories.length > 1 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => changeCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeCategory === cat && !activeTag ? 'bg-[#7B2FBE] text-white' : 'bg-white text-slate-700 shadow-sm hover:bg-slate-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-6">
            {loading && (
              <div className="space-y-6">
                {[1, 2, 3].map(i => <BlogPostSkeleton key={i} />)}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="rounded-[28px] bg-white p-10 text-center shadow-sm">
                <div className="text-6xl mb-4">{search || activeTag ? '🔍' : '✍️'}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {search ? `No posts found for "${search}"` : activeTag ? `No posts tagged "#${activeTag}"` : 'No posts yet'}
                </h3>
                <p className="text-sm text-slate-500">
                  {search || activeTag ? 'Try a different search term or browse all categories.' : 'Check back soon for tips, guides, and insights.'}
                </p>
                {(search || activeTag) && (
                  <button
                    type="button"
                    onClick={() => { changeSearch(''); setActiveTag(null) }}
                    className="mt-4 rounded-2xl bg-[#7B2FBE] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6b23ba]"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            <div className="space-y-6">
              {pagePosts.map((post, i) => (
                <article
                  key={post.id || i}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className={`group cursor-pointer overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-200 hover:shadow-xl ${post.coverImage ? 'flex flex-col gap-0 sm:flex-row' : 'border-l-4 border-[#7B2FBE]'}`}
                >
                  {post.coverImage && (
                    <div className="h-56 w-full overflow-hidden sm:h-auto sm:w-[220px] flex-shrink-0">
                      <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-between gap-4 p-6">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      {post.category && <span className="rounded-full bg-[#f5f0ff] px-3 py-1 font-semibold text-[#7B2FBE]">{post.category}</span>}
                      <span>{post.date ? new Date(post.date).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
                      <span>· {readingTime(post.content)} min read</span>
                      {post.viewCount > 0 && <span>· 👁 {post.viewCount}</span>}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 leading-tight">{post.title}</h2>
                      {post.excerpt && <p className="mt-3 text-sm leading-7 text-slate-600">{post.excerpt}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags?.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={e => { e.stopPropagation(); changeTag(tag) }}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${activeTag === tag ? 'bg-[#7B2FBE] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-[#7B2FBE] font-semibold">
                      {post.authorName && <span>By {post.authorName}</span>}
                      <span>Read more →</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {!loading && totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold transition ${p === page ? 'bg-[#7B2FBE] text-white' : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            )}

            <div className="text-center text-sm text-slate-500">
              <a href="/feed.xml" className="text-slate-500 hover:text-[#7B2FBE]">🔶 Subscribe via RSS</a>
            </div>
          </div>

          <aside className="space-y-6">
            {popularPosts.length > 0 && (
              <section className="rounded-[28px] bg-white p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-900">🔥 Popular Posts</h3>
                <div className="mt-5 space-y-4">
                  {popularPosts.map((post, i) => (
                    <div
                      key={post.id || i}
                      onClick={() => navigate(`/blog/${post.slug}`)}
                      className="flex cursor-pointer items-start gap-3 transition hover:text-[#7B2FBE]"
                    >
                      <span className={`grid h-9 w-9 place-items-center rounded-full text-[11px] font-black ${i === 0 ? 'bg-[#7B2FBE] text-white' : 'bg-[#f0eaf8] text-[#7B2FBE]'}`}>{i + 1}</span>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{post.title}</p>
                        <p className="mt-1 text-xs text-slate-400">👁 {post.viewCount} views · {readingTime(post.content)} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {allTags.length > 0 && (
              <section className="rounded-[28px] bg-white p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-900">🏷️ Tags</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {allTags.map(([tag, count]) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => changeTag(tag)}
                      className={`rounded-full px-3 py-2 text-xs font-semibold transition ${activeTag === tag ? 'bg-[#7B2FBE] text-white' : 'bg-[#f5f0ff] text-[#7B2FBE] hover:bg-[#e9dbff]'}`}
                    >
                      #{tag} <span className="text-[10px] opacity-70">({count})</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-[28px] bg-gradient-to-br from-[#7B2FBE] to-[#5B1F9E] p-6 text-center text-white shadow-sm">
              <p className="text-sm font-bold">Need a print quote?</p>
              <p className="mt-2 text-xs text-white/80">Get a fast quote from our team</p>
              <a href="/quote" className="mt-4 inline-block rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#7B2FBE] transition hover:bg-slate-100">
                Get a Quote →
              </a>
            </section>
          </aside>
        </div>
      </div>
    </section>
  )
}
