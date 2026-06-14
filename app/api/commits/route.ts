import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/drizzle'
import { commits, branches } from '@/db/schema'
import { eq, count } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { branchId, content, message } = await req.json()

  const [branch] = await db
    .select()
    .from(branches)
    .where(eq(branches.id, branchId))

  if (!branch) return NextResponse.json({ error: 'Branch not found' }, { status: 404 })

  const [{ value: commitCount }] = await db
    .select({ value: count() })
    .from(commits)
    .where(eq(commits.branchId, branchId))

  const isSnapshot = commitCount % 20 === 0

  const fileName = `${branch.documentId}/${branchId}/${Date.now()}.json`
  const { error: uploadError } = await supabase.storage
    .from('yjs-states')
    .upload(fileName, JSON.stringify({ content }), {
      contentType: 'application/json',
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const [commit] = await db.insert(commits).values({
    branchId,
    parentCommitId: branch.headCommitId ?? undefined,
    authorId: user.id,
    message: message || '',
    stateUrl: fileName,
    isSnapshot,
  }).returning()

  await db
    .update(branches)
    .set({ headCommitId: commit.id })
    .where(eq(branches.id, branchId))

  return NextResponse.json(commit)
}

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const branchId = searchParams.get('branchId')
  if (!branchId) return NextResponse.json({ error: 'branchId required' }, { status: 400 })

  const history = await db
    .select()
    .from(commits)
    .where(eq(commits.branchId, branchId))
    .orderBy(commits.createdAt)

  return NextResponse.json(history)
}