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
    excerpt: '', content: '', coverImage: '', videoUrl: '', audioUrl: '', mediaFiles: [],
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
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
    const json = await res.json()
    setSaving(false)
    if (json.ok) onSaved()
    else setMsg(json.error || 'Failed to save')
  }

  return (
    <Card style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{isNew ? 'New Blog Post' : 'Edit Post'}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Btn onClick={onCancel} variant="secondary">Cancel</Btn>
          <Btn onClick={() => handleSave('draft')} disabled={saving || uploading} variant="secondary">Save Draft</Btn>
          <Btn onClick={() => handleSave('published')} disabled={saving || uploading}>Publish</Btn>
        </div>
      </div>
      {msg && <div style={{ color: '#EF4444', marginBottom: '12px' }}>{msg}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Title" value={form.title} onChange={e => { set('title', e.target.value); if (isNew) set('slug', slugify(e.target.value)) }} placeholder="Post Title..." />
          <Input label="URL Slug" value={form.slug} onChange={e => set('slug', slugify(e.target.value))} />
          <Input label="Excerpt" value={form.excerpt} onChange={e => set('excerpt', e.target.value)} multiline rows={2} />
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Content</label>
            <TiptapEditor value={form.content} onChange={html => set('content', html)} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Category" value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Printing, Branding" />
          <Input label="Tags (comma separated)" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="diecut, stickers" />
          <Input label="Publish Date" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          <Input label="Author Name" value={form.authorName} onChange={e => set('authorName', e.target.value)} />
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Cover Image</label>
            {form.coverImage && <img src={form.coverImage} alt="Cover" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />}
            <input type="file" accept="image/*" onChange={e => e.target.files[0] && uploadMedia(e.target.files[0], 'coverImage')} disabled={uploading} />
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function BlogCMS({ token }) {
  const [posts, setPosts] = useState([])
  const [editingPost, setEditingPost] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  const loadPosts = useCallback(async () => {
    const res = await fetch('/api/admin/blog', { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setPosts(await res.json())
  }, [token])

  useEffect(() => { loadPosts() }, [loadPosts])

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this post?')) return
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    loadPosts()
  }

  if (isEditing) {
    return <BlogPostEditor token={token} post={editingPost} onSaved={() => { setIsEditing(false); setEditingPost(null); loadPosts() }} onCancel={() => { setIsEditing(false); setEditingPost(null) }} />
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Blog Manager</h1>
        <Btn onClick={() => { setEditingPost(null); setIsEditing(true) }}>+ New Post</Btn>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ padding: '12px 16px' }}>Title</th>
              <th style={{ padding: '12px 16px' }}>Category</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{p.title}</td>
                <td style={{ padding: '12px 16px' }}>{p.category}</td>
                <td style={{ padding: '12px 16px' }}><Badge variant={p.status === 'published' ? 'success' : 'warning'}>{p.status}</Badge></td>
                <td style={{ padding: '12px 16px' }}>{p.date}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <Btn onClick={() => { setEditingPost(p); setIsEditing(true) }} variant="secondary" style={{ marginRight: '8px' }}>Edit</Btn>
                  <Btn onClick={() => handleDelete(p.id)} variant="danger">Delete</Btn>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>No posts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}