"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export type AddDiaryState = { error?: string };

export async function addDiaryEntry(_prevState: AddDiaryState, formData: FormData): Promise<AddDiaryState> {
  const session = await requireSession();

  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const mood = String(formData.get("mood") || "").trim();
  const isShared = formData.get("isShared") === "on";

  if (!content) return { error: "Write something first." };

  const supabase = supabaseAdmin();
  const { error } = await supabase.from("diary_entries").insert({
    author: session.name,
    title: title || null,
    content,
    mood: mood || null,
    is_shared: isShared,
  });

  if (error) return { error: error.message };

  revalidatePath("/diary");
  return {};
}

export async function deleteDiaryEntry(id: string) {
  const session = await requireSession();
  const supabase = supabaseAdmin();
  // Only the author can delete their own entry.
  await supabase.from("diary_entries").delete().eq("id", id).eq("author", session.name);
  revalidatePath("/diary");
}

export async function toggleShare(id: string, isShared: boolean) {
  const session = await requireSession();
  const supabase = supabaseAdmin();
  await supabase.from("diary_entries").update({ is_shared: isShared }).eq("id", id).eq("author", session.name);
  revalidatePath("/diary");
}
