import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/drizzle'
import { documents, branches } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

// GET — ambil semua dokumen milik user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.ownerId, user.id))
    .orderBy(documents.updatedAt)

  return NextResponse.json(docs)
}

// POST — buat dokumen baru + branch main
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Buat dokumen
  const [doc] = await db.insert(documents).values({
    ownerId: user.id,
    title: 'Untitled',
    visibility: 'private',
  }).returning()

  // Buat branch main otomatis
  const [branch] = await db.insert(branches).values({
    documentId: doc.id,
    name: 'main',
    createdBy: user.id,
  }).returning()

  return NextResponse.json({ documentId: doc.id, branchId: branch.id })
}