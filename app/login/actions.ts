"use server";

import { redirect } from "next/navigation";
import { setSessionCookie } from "@/lib/session";
import { PARTNER_NAMES } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const name = String(formData.get("name") || "");
  const passcode = String(formData.get("passcode") || "");
  const sharedPasscode = process.env.SHARED_PASSCODE;

  if (!sharedPasscode) {
    return {
      error: "This site isn't set up yet — SHARED_PASSCODE is missing from the environment.",
    };
  }
  if (!PARTNER_NAMES.includes(name as (typeof PARTNER_NAMES)[number])) {
    return { error: "Choose who you are." };
  }
  if (passcode.length === 0 || passcode !== sharedPasscode) {
    return { error: "That passcode isn't right." };
  }

  await setSessionCookie(name);
  redirect("/");
}
