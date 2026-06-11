import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/drizzle'
import { documents, branches } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))

  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const docBranches = await db
    .select()
    .from(branches)
    .where(eq(branches.documentId, id))

  return NextResponse.json({ ...doc, branches: docBranches })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title } = await req.json()

  const [updated] = await db
    .update(documents)
    .set({ title, updatedAt: new Date() })
    .where(and(eq(documents.id, id), eq(documents.ownerId, user.id)))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await db
    .delete(documents)
    .where(and(eq(documents.id, id), eq(documents.ownerId, user.id)))

  return NextResponse.json({ success: true })
}