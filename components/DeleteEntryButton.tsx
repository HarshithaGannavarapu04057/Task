"use client";

import { useTransition } from "react";
import { deleteEntry } from "@/app/timetable/actions";

export default function DeleteEntryButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => deleteEntry(id))}
      disabled={pending}
      className="text-ink-soft opacity-0 transition-opacity hover:text-blush group-hover:opacity-100"
      aria-label="Remove entry"
      title="Remove"
    >
      &times;
    </button>
  );
}
