import { requireSession, PARTNER_NAMES } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import NavBar from "@/components/NavBar";
import TimetableForm from "@/components/TimetableForm";
import DeleteEntryButton from "@/components/DeleteEntryButton";

export const dynamic = "force-dynamic";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Entry = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  title: string;
  owner: string;
};

function ownerColor(owner: string) {
  if (owner === PARTNER_NAMES[0]) return "text-teal";
  if (owner === PARTNER_NAMES[1]) return "text-blush";
  return "text-gold";
}

export default async function TimetablePage() {
  const session = await requireSession();
  const supabase = supabaseAdmin();

  const { data } = await supabase
    .from("timetable_entries")
    .select("id, day_of_week, start_time, end_time, title, owner")
    .order("start_time", { ascending: true });

  const entries = (data ?? []) as Entry[];
  const byDay: Entry[][] = Array.from({ length: 7 }, (_, i) => entries.filter((e) => e.day_of_week === i));
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar name={session.name} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <h1 className="font-display text-4xl italic text-ink">This week</h1>
        <p className="mt-2 text-ink-soft">
          <span className="text-teal">{PARTNER_NAMES[0]}</span>,{" "}
          <span className="text-blush">{PARTNER_NAMES[1]}</span>, and{" "}
          <span className="text-gold">both of you</span> &mdash; side by side.
        </p>

        <div className="mt-8">
          <TimetableForm partnerNames={PARTNER_NAMES} />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-7">
          {DAYS.map((day, i) => (
            <div key={day} className={`bg-paper p-3 ${i === todayIndex ? "bg-paper-dim" : ""}`}>
              <h2 className="font-display text-sm text-ink">{day}</h2>
              <ul className="mt-3 space-y-2">
                {byDay[i].length === 0 && <li className="text-xs text-ink-soft">&mdash;</li>}
                {byDay[i].map((e) => (
                  <li key={e.id} className="group border-b border-line pb-2 text-xs">
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-ink-soft">
                        {e.start_time.slice(0, 5)}&ndash;{e.end_time.slice(0, 5)}
                      </span>
                      <DeleteEntryButton id={e.id} />
                    </div>
                    <p className="text-ink">{e.title}</p>
                    <p className={ownerColor(e.owner)}>{e.owner}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
