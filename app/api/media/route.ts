import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { PARTNER_NAMES } from "@/lib/auth";
import { supabaseAdmin, MEDIA_BUCKET } from "@/lib/supabase";

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || !PARTNER_NAMES.includes(session.name as (typeof PARTNER_NAMES)[number])) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const supabase = supabaseAdmin();
  const { data: row } = await supabase.from("media").select("storage_path").eq("id", id).single();
  if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await supabase.storage.from(MEDIA_BUCKET).remove([row.storage_path]);
  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
