'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Copy, Trash2, Settings, Plus, FileText } from 'lucide-react'
import Link from 'next/link'

interface Document {
  id: string
  title: string
  visibility: string
  updated_at: string
  branchId?: string
  preview?: string | null
}

const PREVIEW_PATTERNS = [
  ['title', 'long', 'med', 'short', 'long'],
  ['title', 'med', 'long', 'short'],
  ['title', 'long', 'short', 'med', 'long'],
  ['title', 'short', 'long', 'med'],
]

function SkeletonPreview({ pattern }: { pattern: string[] }) {
  return (
    <div className="h-[88px] rounded-md bg-muted/50 border border-border p-3 overflow-hidden">
      {pattern.map((w, i) => (
        <div
          key={i}
          className="rounded-sm bg-muted mb-1.5"
          style={{
            height: w === 'title' ? '9px' : '6px',
            width: w === 'title' ? '65%' : w === 'long' ? '95%' : w === 'med' ? '78%' : '55%',
            marginBottom: w === 'title' ? '10px' : '6px',
            opacity: w === 'title' ? 0.7 : 0.45,
          }}
        />
      ))}
    </div>
  )
}

function PreviewCard({ preview, pattern }: { preview?: string | null; pattern: string[] }) {
  if (!preview) return <SkeletonPreview pattern={pattern} />

  return (
    <div className="h-[88px] rounded-md bg-muted/50 border border-border p-3 overflow-hidden">
      <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-4">
        {preview}
      </p>
    </div>
  )
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export default function DocumentList({ userId }: { userId: string }) {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchDocuments() }, [])

  async function fetchDocuments() {
    const res = await fetch('/api/documents')
    const data = await res.json()
    setDocuments(data)
    setLoading(false)
  }

  async function createDocument() {
    setCreating(true)
    const res = await fetch('/api/documents', { method: 'POST' })
    const doc = await res.json()
    router.push(`/documents/${doc.documentId}/${doc.branchId}`)
  }

  function openDeleteDialog(e: React.MouseEvent, doc: Document) {
    e.stopPropagation()
    setDocumentToDelete(doc)
    setDeleteDialogOpen(true)
  }

  function closeDeleteDialog() {
    setDeleteDialogOpen(false)
    setDocumentToDelete(null)
  }

  async function confirmDeleteDocument() {
    if (!documentToDelete) return
    setDeletingId(documentToDelete.id)
    const res = await fetch(`/api/documents/${documentToDelete.id}`, { method: 'DELETE' })
    if (res.ok) {
      await fetchDocuments()
    }
    setDeletingId(null)
    closeDeleteDialog()
  }

  const filtered = documents.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto px-5 py-10 space-y-6">
      {/* Topbar */}
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-medium tracking-tight">My Documents</h1>
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            onClick={createDocument}
            disabled={creating}
            className="h-8 px-3 text-sm rounded-lg gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {creating ? 'Creating...' : 'New document'}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm bg-muted/50 border-border"
        />
      </div>

      {/* Section label */}
      {!loading && filtered.length > 0 && (
        <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          Recents
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-background p-3.5 space-y-3 animate-pulse">
              <div className="h-[88px] rounded-md bg-muted" />
              <div className="space-y-1.5">
                <div className="h-3 w-3/4 rounded bg-muted" />
                <div className="h-2.5 w-1/2 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <FileText className="h-8 w-8 mx-auto text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {search ? 'No documents found' : 'No documents yet'}
          </p>
          <p className="text-xs text-muted-foreground/60">
            {search ? 'Try a different search term' : 'Create your first document to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((doc, i) => (
            <div
              key={doc.id}
              onClick={() => doc.branchId && router.push(`/documents/${doc.id}/${doc.branchId}`)}
              className="group relative rounded-xl border border-border bg-background p-3.5 space-y-3 cursor-pointer hover:border-border/80 hover:bg-accent/30 transition-colors"
            >
              {/* Preview */}
              <PreviewCard
                preview={doc.preview}
                pattern={PREVIEW_PATTERNS[i % PREVIEW_PATTERNS.length]}
              />

              {/* Info */}
              <div>
                <p className="text-[13px] font-medium truncate text-foreground mb-1">
                  {doc.title || 'Untitled'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {timeAgo(doc.updated_at)}
                  {doc.visibility === 'public' && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border text-[10px]">
                      Public
                    </span>
                  )}
                </p>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-md"
                  onClick={(e) => { e.stopPropagation() }}
                  title="Duplicate"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-md text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => openDeleteDialog(e, doc)}
                  disabled={deletingId === doc.id}
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete document"
        description={
          documentToDelete
            ? `Are you sure you want to delete "${documentToDelete.title || 'Untitled'}"? This cannot be undone.`
            : 'Are you sure you want to delete this document?'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={Boolean(deletingId)}
        onConfirm={confirmDeleteDocument}
        onCancel={closeDeleteDialog}
      />
    </div>
  )
}