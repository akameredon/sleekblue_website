import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PRI, PRI_LIGHT, ACC, SIDEBAR_W, authH, fmt, Card, Btn, Input, Badge, SaveBar } from './AdminUI';
import { ALL_PRODUCTS, STICKER_SIZE_PRICES, getProductDetails } from '../../data/products';
import { AnalyticsView, ReportsView } from '../../components/AdminAnalytics';
import TiptapEditor from '../../components/TiptapEditor';
import logo from '@assets/SLEEKBLUE_LOGO_1779927359068.jpg';

export function BlogPostEditor({ token, post, onSaved, onCancel }) {
  const isNew = !post?.id
  const [form, setForm] = useState({
    title: '', slug: '', status: 'draft', category: '', date: new Date().toISOString().split('T')[0],
    excerpt: '', content: '', coverImage: '', tags: '', videoUrl: '', audioUrl: '', mediaFiles: [],
    authorName: '', authorBio: '', publishAt: '',
    ...(post || {}),
    tags: Array.isArray(post?.tags) ? post.tags.join(', ') : (post?.tags || ''),
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState(null)

  function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function uploadMedia(file, field) {
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/admin/upload/blog', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
    const json = await res.json()
    setUploading(false)
    if (!json.url) return
    if (field === 'coverImage') set('coverImage', json.url)
    else if (field === 'audioUrl') set('audioUrl', json.url)
    else set('mediaFiles', [...(form.mediaFiles || []), json.url])
  }

  async function handleSave(statusOverride) {
    setSaving(true); setMsg(null)
    const payload = {
      ...form,
      status: statusOverride || form.status,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      slug: form.slug || slugify(form.title),
    }
    const url = isNew ? '/api/admin/blog' : `/api/admin/blog/${post.id}`
    const method = isNew ? 'POST' : 'PUT'
    const res = await fetch(url, { method, headers: authH(token), body: JSON.stringify(payload) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setMsg({ type: 'error', text: data.error || 'Failed to save.' }); return }
    setMsg({ type: 'success', text: statusOverride === 'published' ? '✓ Post published!' : '✓ Saved as draft.' })
    setTimeout(() => { onSaved(); }, 1200)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Btn variant="ghost" onClick={onCancel} className="px-4 py-2">← Back</Btn>
        <h2 className="text-[20px] font-extrabold text-slate-900 m-0">
          {isNew ? '✍️ New Blog Post' : '✏️ Edit Post'}
        </h2>
        {!isNew && <Badge color={form.status === 'published' ? '#16a34a' : '#f59e0b'}>{form.status === 'published' ? 'Published' : 'Draft'}</Badge>}
      </div>
      {msg && <div className={`mb-4 rounded-2xl px-4 py-3 text-sm ${msg.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{msg.text}</div>}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Post Details</h3>
            <Input label="Post Title *" value={form.title} onChange={e => { set('title', e.target.value); if (!post?.slug) set('slug', slugify(e.target.value)) }} placeholder="Enter a compelling title…" />
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="URL Slug" value={form.slug} onChange={e => set('slug', slugify(e.target.value))} placeholder="url-friendly-slug" />
              <Input label="Category" value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Branding Tips" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Date" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              <Input label="Tags (comma separated)" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="stickers, branding, tips" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Author Name" value={form.authorName || ''} onChange={e => set('authorName', e.target.value)} placeholder="e.g. Sleekblue Team" />
              <Input label="Schedule Publish At (optional)" type="datetime-local" value={form.publishAt || ''} onChange={e => set('publishAt', e.target.value)} />
            </div>
            <Input label="Author Bio (optional)" value={form.authorBio || ''} onChange={e => set('authorBio', e.target.value)} rows={2} placeholder="Brief bio shown at the bottom of the post…" />
            <Input label="Excerpt / Summary" value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={3} placeholder="A short summary that appears on the blog list page…" />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Content</h3>
            <p className="text-sm text-slate-500 mb-4">Use the rich text editor below — format headings, bold, lists, links, and more.</p>
            <TiptapEditor
              value={form.content}
              onChange={v => set('content', v)}
              placeholder="Write your full blog post here…"
              height={460}
            />
          </Card>
        </div>

        <Card>
          <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Cover Image</h3>
          {form.coverImage && (
            <div className="relative mb-3 overflow-hidden rounded-2xl">
              <img src={form.coverImage} alt="Cover" className="block h-[160px] w-full object-cover" />
              <button onClick={() => set('coverImage', '')} className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm text-white">×</button>
            </div>
          )}
          <label className="block cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadMedia(e.target.files[0], 'coverImage')} />
            <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5 text-center">
              <div className="text-2xl mb-2">🖼️</div>
              <p className="text-sm text-slate-500">{uploading ? 'Uploading…' : 'Click to upload cover image'}</p>
            </div>
          </label>
          <Input label="Or enter image URL" value={form.coverImage} onChange={e => set('coverImage', e.target.value)} placeholder="https://…" className="mt-3" />
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Media Files</h3>
          <p className="text-sm text-slate-500 mb-3">Upload additional images that appear in a gallery at the bottom of the post.</p>
          {form.mediaFiles?.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-3 mb-3">
              {form.mediaFiles.map((url, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-2xl">
                  <img src={url} alt={`Media ${i+1}`} className="h-full w-full object-cover" />
                  <button onClick={() => set('mediaFiles', form.mediaFiles.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[10px] text-white">×</button>
                </div>
              ))}
            </div>
          )}
          <label className="block cursor-pointer">
            <input type="file" accept="image/*" multiple className="hidden" onChange={e => Array.from(e.target.files).forEach(f => uploadMedia(f, 'media'))} />
            <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">⬆ Upload images (select multiple)</p>
            </div>
          </label>
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Video</h3>
          <Input label="YouTube URL or direct video URL" value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=…" />
          {form.videoUrl && <p className="mt-2 text-[11px] text-emerald-600">✓ Video will be embedded in the post</p>}
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-[#7B2FBE] mb-4">Audio</h3>
          {form.audioUrl && (
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-[#f5f0ff] p-3 text-sm text-[#7B2FBE]">
              <span>🎙️ Audio uploaded</span>
              <button onClick={() => set('audioUrl', '')} className="text-rose-600">×</button>
            </div>
          )}
          <label className="block cursor-pointer mb-3">
            <input type="file" accept="audio/*" className="hidden" onChange={e => e.target.files[0] && uploadMedia(e.target.files[0], 'audioUrl')} />
            <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">🎙️ Upload audio file (MP3, WAV…)</p>
            </div>
          </label>
          <Input label="Or enter audio URL" value={form.audioUrl} onChange={e => set('audioUrl', e.target.value)} placeholder="https://…" />
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5 mt-6">
        <Btn onClick={() => handleSave('published')} disabled={saving} className="min-w-[160px] bg-emerald-600 hover:bg-emerald-700">{saving ? 'Saving…' : '🚀 Publish Post'}</Btn>
        <Btn variant="ghost" onClick={() => handleSave('draft')} disabled={saving}>💾 Save as Draft</Btn>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  )
}

export function BlogView({ token, posts, onDataChanged }) {
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [localPosts, setLocalPosts] = useState(posts || [])

  useEffect(() => { setLocalPosts(posts || []) }, [posts])

  async function handleDelete(id) {
    if (!confirm('Delete this blog post? This cannot be undone.')) return
    setDeleting(id)
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE', headers: authH(token) })
    setDeleting(null)
    onDataChanged()
  }

  async function handleReorder(newOrder) {
    setLocalPosts(newOrder)
    await fetch('/api/admin/blog/reorder', { method: 'PUT', headers: authH(token), body: JSON.stringify({ posts: newOrder }) })
    onDataChanged()
  }

  function handleDragStart(e, idx) { e.dataTransfer.setData('idx', idx) }
  function handleDrop(e, dropIdx) {
    const dragIdx = parseInt(e.dataTransfer.getData('idx'))
    if (dragIdx === dropIdx) return
    const reordered = [...localPosts]
    const [moved] = reordered.splice(dragIdx, 1)
    reordered.splice(dropIdx, 0, moved)
    handleReorder(reordered)
    setDragOver(null)
  }

  if (creating) return <BlogPostEditor token={token} post={null} onSaved={() => { setCreating(false); onDataChanged() }} onCancel={() => setCreating(false)} />
  if (editing) return <BlogPostEditor token={token} post={editing} onSaved={() => { setEditing(null); onDataChanged() }} onCancel={() => setEditing(null)} />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-[20px] font-extrabold text-slate-900 mb-1">Blog Manager</h2>
          <p className="text-sm text-slate-500">{localPosts.filter(p => p.status === 'published').length} published · {localPosts.filter(p => p.status === 'draft').length} drafts · Drag rows to reorder</p>
        </div>
        <Btn onClick={() => setCreating(true)}>✍️ New Blog Post</Btn>
      </div>

      {localPosts.length === 0 && (
        <Card className="text-center p-16">
          <div className="text-4xl mb-4">✍️</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No blog posts yet</h3>
          <p className="text-sm text-slate-500 mb-5">Create your first post to engage your audience and boost SEO.</p>
          <Btn onClick={() => setCreating(true)}>✍️ Create First Post</Btn>
        </Card>
      )}

      {localPosts.map((post, idx) => (
        <div key={post.id} draggable onDragStart={e => handleDragStart(e, idx)} onDragOver={e => { e.preventDefault(); setDragOver(idx) }} onDrop={e => handleDrop(e, idx)} onDragLeave={() => setDragOver(null)}
          className={`mb-2 flex min-w-0 flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition-border ${dragOver === idx ? 'border-2 border-[#7B2FBE]' : 'border-2 border-transparent'}`}>
          <div className="text-slate-400 text-xl flex-shrink-0 cursor-grab select-none">⠿</div>
          {post.coverImage
            ? <img src={post.coverImage} alt="" className="h-[40px] w-[56px] rounded-lg object-cover flex-shrink-0" />
            : <div className="flex h-[40px] w-[56px] items-center justify-center rounded-lg bg-[#f0e8ff] text-lg flex-shrink-0">✍️</div>
          }
          <div className="min-w-[120px] flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-slate-900">{post.title || 'Untitled'}</span>
              <Badge color={post.status === 'published' ? '#16a34a' : '#f59e0b'}>{post.status === 'published' ? 'Published' : 'Draft'}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
              {post.category && <span>{post.category}</span>}
              {post.date && <span>{post.date}</span>}
              {post.videoUrl && <span>🎬</span>}
              {post.audioUrl && <span>🎙️</span>}
              {post.mediaFiles?.length > 0 && <span>🖼️{post.mediaFiles.length}</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            <Btn variant="ghost" onClick={() => setEditing(post)} className="px-3 py-2 text-sm">✏️ Edit</Btn>
            <Btn variant="danger" onClick={() => handleDelete(post.id)} disabled={deleting === post.id} className="px-3 py-2 text-sm">{deleting === post.id ? '…' : '🗑️'}</Btn>
          </div>
        </div>
      ))}
    </div>
  )
}
