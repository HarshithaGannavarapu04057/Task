import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export { MEDIA_BUCKET } from "./constants";

let client: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the SERVICE ROLE key.
 * Never import this file from a Client Component — it must stay on the server.
 * Access control happens entirely through the app's own login (see lib/session.ts),
 * since the Supabase bucket/tables are private and only ever touched from server code.
 */
export function supabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see README.md)."
    );
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
