import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "./session";

export const PARTNER_NAMES = [
  process.env.NEXT_PUBLIC_PARTNER_A_NAME || "Partner A",
  process.env.NEXT_PUBLIC_PARTNER_B_NAME || "Partner B",
] as const;

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || !PARTNER_NAMES.includes(session.name as (typeof PARTNER_NAMES)[number])) {
    redirect("/login");
  }
  return session;
}

export function otherPartner(name: string) {
  return PARTNER_NAMES.find((n) => n !== name) ?? PARTNER_NAMES[0];
}
