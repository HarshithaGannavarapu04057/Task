"use client";

import { useTransition } from "react";
import { deleteDiaryEntry, toggleShare } from "@/app/diary/actions";

export default function DiaryEntryControls({ id, isShared }: { id: string; isShared: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-3 flex items-center gap-4 text-xs text-ink-soft">
      <button
        onClick={() => startTransition(() => toggleShare(id, !isShared))}
        disabled={pending}
        className="underline hover:text-ink"
      >
        {isShared ? "Make private" : "Share with partner"}
      </button>
      <button
        onClick={() => {
          if (confirm("Delete this entry for good?")) startTransition(() => deleteDiaryEntry(id));
        }}
        disabled={pending}
        className="underline hover:text-blush"
      >
        Delete
      </button>
    </div>
  );
}
