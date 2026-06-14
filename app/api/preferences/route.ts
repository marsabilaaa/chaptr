import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle";
import { userPreferences } from "@/db/schema/user_preferences";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { DEFAULT_THEME_ID } from "@/lib/themes/presets";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [pref] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, user.id));

    if (!pref) {
      return NextResponse.json({
        themeId: DEFAULT_THEME_ID,
        mode: "system",
        customTheme: null,
      });
    }

    return NextResponse.json(pref);
  } catch (err) {
    return NextResponse.json({
      themeId: DEFAULT_THEME_ID,
      mode: "system",
      customTheme: null,
    });
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { themeId, customTheme, mode } = body || {};

  try {
    const [existing] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, user.id));

    if (existing) {
      await db
        .update(userPreferences)
        .set({
          themeId: themeId ?? existing.themeId,
          customTheme: customTheme ?? existing.customTheme,
          mode: mode ?? existing.mode,
        })
        .where(eq(userPreferences.userId, user.id));
      return NextResponse.json({ ok: true });
    }

    await db.insert(userPreferences).values({
      userId: user.id,
      themeId: themeId ?? DEFAULT_THEME_ID,
      customTheme: customTheme ?? null,
      mode: mode ?? "system",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: true });
  }
}
