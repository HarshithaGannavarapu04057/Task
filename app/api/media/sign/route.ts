import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { PARTNER_NAMES } from "@/lib/auth";
import { supabaseAdmin, MEDIA_BUCKET } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !PARTNER_NAMES.includes(session.name as (typeof PARTNER_NAMES)[number])) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { filename, type } = await request.json();
  if (typeof filename !== "string" || typeof type !== "string") {
    return NextResponse.json({ error: "Missing filename or type." }, { status: 400 });
  }
  const isVideo = type.startsWith("video/");
  const isImage = type.startsWith("image/");
  if (!isVideo && !isImage) {
    return NextResponse.json({ error: "Only photos and videos are supported." }, { status: 400 });
  }

  const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${session.name}/${Date.now()}-${safeName}`;

  const supabase = supabaseAdmin();
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Could not prepare upload." }, { status: 500 });
  }

  return NextResponse.json({
    path,
    token: data.token,
    kind: isVideo ? "video" : "image",
  });
}
