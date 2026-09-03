"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteMediaButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm("Remove this from the gallery for good?")) return;
    setBusy(true);
    await fetch(`/api/media?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="absolute right-2 top-2 hidden bg-ink/80 px-2 py-1 text-xs text-paper group-hover:block"
    >
      {busy ? "…" : "Remove"}
    </button>
  );
}
