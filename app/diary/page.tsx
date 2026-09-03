import { requireSession, otherPartner } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import NavBar from "@/components/NavBar";
import DiaryForm from "@/components/DiaryForm";
import DiaryEntryControls from "@/components/DiaryEntryControls";

export const dynamic = "force-dynamic";

type Entry = {
  id: string;
  author: string;
  title: string | null;
  content: string;
  mood: string | null;
  is_shared: boolean;
  created_at: string;
};

export default async function DiaryPage() {
  const session = await requireSession();
  const partner = otherPartner(session.name);
  const supabase = supabaseAdmin();

  const [{ data: mine }, { data: shared }] = await Promise.all([
    supabase
      .from("diary_entries")
      .select("id, author, title, content, mood, is_shared, created_at")
      .eq("author", session.name)
      .order("created_at", { ascending: false }),
    supabase
      .from("diary_entries")
      .select("id, author, title, content, mood, is_shared, created_at")
      .eq("author", partner)
      .eq("is_shared", true)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar name={session.name} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="font-display text-4xl italic text-ink">Diary</h1>
        <p className="mt-2 text-ink-soft">
          Your pages are private unless you choose to share one. {partner}&rsquo;s pages stay theirs unless
          they share too.
        </p>

        <div className="mt-8">
          <DiaryForm />
        </div>

        <section className="mt-14">
          <h2 className="border-b border-line pb-2 font-display text-2xl text-ink">Your pages</h2>
          <EntryList entries={(mine as Entry[]) ?? []} showControls />
        </section>

        <section className="mt-14">
          <h2 className="border-b border-line pb-2 font-display text-2xl text-ink">
            Shared by {partner}
          </h2>
          <EntryList entries={(shared as Entry[]) ?? []} showControls={false} />
        </section>
      </main>
    </div>
  );
}

function EntryList({ entries, showControls }: { entries: Entry[]; showControls: boolean }) {
  if (entries.length === 0) {
    return <p className="mt-6 text-ink-soft">Nothing here yet.</p>;
  }
  return (
    <ul className="mt-6 space-y-6">
      {entries.map((e) => (
        <li key={e.id} className="border border-line bg-paper-dim p-5">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-lg text-ink">{e.title || "Untitled"}</h3>
            <span className="text-xs text-ink-soft">
              {new Date(e.created_at).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          {e.mood && <p className="mt-1 text-sm italic text-gold">Feeling {e.mood.toLowerCase()}</p>}
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">{e.content}</p>
          {showControls && <DiaryEntryControls id={e.id} isShared={e.is_shared} />}
        </li>
      ))}
    </ul>
  );
}
