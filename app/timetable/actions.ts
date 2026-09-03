"use server";

import { revalidatePath } from "next/cache";
import { requireSession, PARTNER_NAMES } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export type AddEntryState = { error?: string };

export async function addEntry(_prevState: AddEntryState, formData: FormData): Promise<AddEntryState> {
  await requireSession();

  const dayOfWeek = Number(formData.get("dayOfWeek"));
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");
  const title = String(formData.get("title") || "").trim();
  const owner = String(formData.get("owner") || "both");
  const color = String(formData.get("color") || "gold");

  if (Number.isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return { error: "Pick a day." };
  }
  if (!startTime || !endTime) return { error: "Pick a start and end time." };
  if (!title) return { error: "Give it a title." };
  if (startTime >= endTime) return { error: "End time has to be after the start time." };

  const supabase = supabaseAdmin();
  const { error } = await supabase.from("timetable_entries").insert({
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
    title,
    owner: PARTNER_NAMES.includes(owner as (typeof PARTNER_NAMES)[number]) ? owner : "both",
    color,
  });

  if (error) return { error: error.message };

  revalidatePath("/timetable");
  revalidatePath("/");
  return {};
}

export async function deleteEntry(id: string) {
  await requireSession();
  const supabase = supabaseAdmin();
  await supabase.from("timetable_entries").delete().eq("id", id);
  revalidatePath("/timetable");
  revalidatePath("/");
}
