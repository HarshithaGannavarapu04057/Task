import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { supabaseAdmin, MEDIA_BUCKET } from "@/lib/supabase";
import NavBar from "@/components/NavBar";

export const dynamic = "force-dynamic";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default async function HomePage() {
  const session = await requireSession();
  const supabase = supabaseAdmin();

  const [{ data: recentMedia }, { data: todayEvents }] = await Promise.all([
    supabase
      .from("media")
      .select("id, kind, storage_path, caption, author")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("timetable_entries")
      .select("id, title, start_time, end_time, owner, color")
      .eq("day_of_week", (new Date().getDay() + 6) % 7)
      .order("start_time", { ascending: true }),
  ]);

  const mediaWithUrls = await Promise.all(
    (recentMedia ?? []).map(async (m) => {
      const { data } = await supabase.storage
        .from(MEDIA_BUCKET)
        .createSignedUrl(m.storage_path, 60 * 10);
      return { ...m, url: data?.signedUrl };
    })
  );

  const todayName = DAY_NAMES[(new Date().getDay() + 6) % 7];

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar name={session.name} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <h1 className="font-display text-4xl italic text-ink">Hello, {session.name}.</h1>
        <p className="mt-2 max-w-md text-ink-soft">
          Everything the two of you have kept, in one quiet place.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <DoorCard href="/gallery" title="Gallery" description="Photos and videos of you two." />
          <DoorCard href="/timetable" title="Timetable" description="This week, side by side." />
          <DoorCard href="/diary" title="Diary" description="Private pages, and shared ones." />
        </div>

        <section className="mt-16">
          <div className="flex items-baseline justify-between border-b border-line pb-2">
            <h2 className="font-display text-2xl text-ink">Recent memories</h2>
            <Link href="/gallery" className="text-sm text-ink-soft underline hover:text-ink">
              See all
            </Link>
          </div>
          {mediaWithUrls.length === 0 ? (
            <p className="mt-6 text-ink-soft">
              Nothing here yet &mdash; the first photo or video you upload will show up on this shelf.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-3 gap-3">
              {mediaWithUrls.map((m) => (
                <div key={m.id} className="aspect-square overflow-hidden border border-line bg-paper-dim">
                  {m.kind === "image" && m.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.caption ?? ""} className="h-full w-full object-cover" />
                  ) : m.url ? (
                    <video src={m.url} className="h-full w-full object-cover" muted />
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-16">
          <div className="flex items-baseline justify-between border-b border-line pb-2">
            <h2 className="font-display text-2xl text-ink">Today &mdash; {todayName}</h2>
            <Link href="/timetable" className="text-sm text-ink-soft underline hover:text-ink">
              Full week
            </Link>
          </div>
          {!todayEvents || todayEvents.length === 0 ? (
            <p className="mt-6 text-ink-soft">Nothing on the timetable for today.</p>
          ) : (
            <ul className="mt-6 space-y-2">
              {todayEvents.map((e) => (
                <li key={e.id} className="flex items-center gap-4 border-b border-line py-2 text-sm">
                  <span className="w-28 shrink-0 text-ink-soft">
                    {e.start_time.slice(0, 5)}&ndash;{e.end_time.slice(0, 5)}
                  </span>
                  <span className="flex-1 text-ink">{e.title}</span>
                  <span className="text-ink-soft">{e.owner}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function DoorCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="group block border border-line bg-paper-dim px-6 py-8 transition-colors hover:border-ink"
    >
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink-soft">{description}</p>
      <span className="mt-4 inline-block text-sm text-gold group-hover:underline">Open &rarr;</span>
    </Link>
  );
}
