import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle";
import { documents, branches, commits } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const docs = await db
    .select({
      id: documents.id,
      title: documents.title,
      visibility: documents.visibility,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
      branchId: branches.id,
    })
    .from(documents)
    .leftJoin(
      branches,
      and(eq(branches.documentId, documents.id), eq(branches.name, "main"))
    )
    .where(eq(documents.ownerId, user.id))
    .orderBy(desc(documents.updatedAt))

  const enriched = await Promise.all(docs.map(async (doc) => {
    if (!doc.branchId) return { ...doc, preview: null }

    const [latestCommit] = await db
      .select()
      .from(commits)
      .where(eq(commits.branchId, doc.branchId))
      .orderBy(desc(commits.createdAt))
      .limit(1)

    if (!latestCommit?.stateUrl) return { ...doc, preview: null }

    const { data } = await supabase.storage
      .from('yjs-states')
      .download(latestCommit.stateUrl)

    if (!data) return { ...doc, preview: null }

    const text = await data.text()
    const parsed = JSON.parse(text)
    const preview = parsed.content
      ?.replace(/<[^>]*>/g, ' ')
      ?.replace(/\s+/g, ' ')
      ?.trim()
      ?.slice(0, 120) ?? null

    return { ...doc, preview }
  }))

  return NextResponse.json(enriched)
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [doc] = await db
    .insert(documents)
    .values({
      ownerId: user.id,
      title: "Untitled",
      visibility: "private",
    })
    .returning();

  const [branch] = await db
    .insert(branches)
    .values({
      documentId: doc.id,
      name: "main",
      createdBy: user.id,
    })
    .returning();

  return NextResponse.json({ documentId: doc.id, branchId: branch.id });
}