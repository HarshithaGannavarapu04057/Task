"use client";

import { useActionState } from "react";
import { addDiaryEntry, type AddDiaryState } from "@/app/diary/actions";

const initialState: AddDiaryState = {};

export default function DiaryForm() {
  const [state, formAction, pending] = useActionState(addDiaryEntry, initialState);

  return (
    <form action={formAction} className="space-y-3 border border-line bg-paper-dim p-6">
      <input
        type="text"
        name="title"
        placeholder="Title (optional)"
        className="w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
      />
      <textarea
        name="content"
        required
        rows={5}
        placeholder="Write whatever you want to remember…"
        className="w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
      />
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          name="mood"
          placeholder="Mood (optional)"
          className="w-40 border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        />
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" name="isShared" className="accent-ink" />
          Share this one with your partner
        </label>
        <button
          type="submit"
          disabled={pending}
          className="ml-auto bg-ink px-5 py-2 text-sm text-paper hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save entry"}
        </button>
      </div>
      {state.error && <p className="text-sm text-blush">{state.error}</p>}
    </form>
  );
}
