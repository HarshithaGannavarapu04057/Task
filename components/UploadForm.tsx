"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadWithSignedUrl } from "@/lib/supabase-browser";

export default function UploadForm() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");
  const [progressLabel, setProgressLabel] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInput.current?.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setError("");
    try {
      setProgressLabel("Preparing…");
      const signRes = await fetch("/api/media/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, type: file.type }),
      });
      const signData = await signRes.json();
      if (!signRes.ok) throw new Error(signData.error || "Could not start the upload.");

      setProgressLabel(file.type.startsWith("video/") ? "Uploading video…" : "Uploading photo…");
      await uploadWithSignedUrl(signData.path, signData.token, file);

      setProgressLabel("Saving…");
      const confirmRes = await fetch("/api/media/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: signData.path, kind: signData.kind, caption }),
      });
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmData.error || "Could not save the upload.");

      setCaption("");
      if (fileInput.current) fileInput.current.value = "";
      setStatus("idle");
      setProgressLabel("");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-paper-dim p-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="mb-2 block text-sm text-ink-soft">Add a photo or video</label>
          <input
            ref={fileInput}
            type="file"
            accept="image/*,video/*"
            required
            className="block w-full text-sm text-ink file:mr-4 file:border file:border-ink file:bg-transparent file:px-3 file:py-1.5 file:text-ink"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="A little caption (optional)"
            className="mt-3 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
          />
        </div>
        <button
          type="submit"
          disabled={status === "uploading"}
          className="h-fit self-end bg-ink px-5 py-2 text-sm text-paper hover:opacity-90 disabled:opacity-60"
        >
          {status === "uploading" ? progressLabel || "Uploading…" : "Add to gallery"}
        </button>
      </div>
      {status === "error" && <p className="mt-3 text-sm text-blush">{error}</p>}
    </form>
  );
}
