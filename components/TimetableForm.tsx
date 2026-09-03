"use client";

import { useActionState } from "react";
import { addEntry, type AddEntryState } from "@/app/timetable/actions";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const initialState: AddEntryState = {};

export default function TimetableForm({ partnerNames }: { partnerNames: readonly string[] }) {
  const [state, formAction, pending] = useActionState(addEntry, initialState);

  return (
    <form action={formAction} className="grid gap-3 border border-line bg-paper-dim p-6 sm:grid-cols-6">
      <select name="dayOfWeek" defaultValue="0" className="border border-line bg-paper px-3 py-2 text-sm sm:col-span-1">
        {DAYS.map((d, i) => (
          <option key={d} value={i}>
            {d}
          </option>
        ))}
      </select>
      <input type="time" name="startTime" required className="border border-line bg-paper px-3 py-2 text-sm sm:col-span-1" />
      <input type="time" name="endTime" required className="border border-line bg-paper px-3 py-2 text-sm sm:col-span-1" />
      <input
        type="text"
        name="title"
        required
        placeholder="What's happening?"
        className="border border-line bg-paper px-3 py-2 text-sm sm:col-span-2"
      />
      <select name="owner" defaultValue="both" className="border border-line bg-paper px-3 py-2 text-sm sm:col-span-1">
        <option value="both">Both</option>
        {partnerNames.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="bg-ink px-4 py-2 text-sm text-paper hover:opacity-90 disabled:opacity-60 sm:col-span-6"
      >
        {pending ? "Adding…" : "Add to timetable"}
      </button>
      {state.error && <p className="text-sm text-blush sm:col-span-6">{state.error}</p>}
    </form>
  );
}
