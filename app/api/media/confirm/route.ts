import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { PARTNER_NAMES } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !PARTNER_NAMES.includes(session.name as (typeof PARTNER_NAMES)[number])) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { path, kind, caption } = await request.json();
  if (typeof path !== "string" || (kind !== "image" && kind !== "video")) {
    return NextResponse.json({ error: "Invalid upload details." }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("media")
    .insert({
      author: session.name,
      kind,
      storage_path: path,
      caption: typeof caption === "string" && caption.trim() ? caption.trim() : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ media: data });
}
