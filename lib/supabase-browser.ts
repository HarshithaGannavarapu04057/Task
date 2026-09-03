"use client";

import { createClient } from "@supabase/supabase-js";
import { MEDIA_BUCKET } from "./constants";

let client: ReturnType<typeof createClient> | null = null;

function browserClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set.");
  }
  client = createClient(url, anonKey, { auth: { persistSession: false } });
  return client;
}

/**
 * Uploads a file straight to Supabase Storage using a one-time signed URL
 * obtained from our own server (/api/media/sign). The file never passes
 * through our Next.js server, so large videos aren't limited by the
 * serverless function's request body size.
 */
export async function uploadWithSignedUrl(path: string, token: string, file: File) {
  const supabase = browserClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).uploadToSignedUrl(path, token, file);
  if (error) throw error;
}

export { MEDIA_BUCKET };
