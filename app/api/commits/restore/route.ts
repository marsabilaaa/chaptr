import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const stateUrl = searchParams.get("stateUrl");
  if (!stateUrl)
    return NextResponse.json({ error: "stateUrl required" }, { status: 400 });

  const { data, error } = await supabase.storage
    .from("yjs-states")
    .download(stateUrl);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const text = await data.text();
  const parsed = JSON.parse(text);

  return NextResponse.json(parsed);
}
