import { requireSession } from "@/lib/auth";
import { supabaseAdmin, MEDIA_BUCKET } from "@/lib/supabase";
import NavBar from "@/components/NavBar";
import UploadForm from "@/components/UploadForm";
import DeleteMediaButton from "@/components/DeleteMediaButton";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const session = await requireSession();
  const supabase = supabaseAdmin();

  const { data: media } = await supabase
    .from("media")
    .select("id, kind, storage_path, caption, author, created_at")
    .order("created_at", { ascending: false });

  const items = await Promise.all(
    (media ?? []).map(async (m) => {
      const { data } = await supabase.storage
        .from(MEDIA_BUCKET)
        .createSignedUrl(m.storage_path, 60 * 30);
      return { ...m, url: data?.signedUrl };
    })
  );

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar name={session.name} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <h1 className="font-display text-4xl italic text-ink">Gallery</h1>
        <p className="mt-2 text-ink-soft">Every photo and video the two of you have kept here.</p>

        <div className="mt-8">
          <UploadForm />
        </div>

        {items.length === 0 ? (
          <p className="mt-12 text-ink-soft">Nothing uploaded yet. Add your first memory above.</p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((m) => (
              <figure key={m.id} className="group relative border border-line bg-paper-dim">
                <div className="aspect-square overflow-hidden">
                  {m.url && m.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.caption ?? ""} className="h-full w-full object-cover" />
                  ) : m.url ? (
                    <video src={m.url} className="h-full w-full object-cover" controls />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-ink-soft">
                      Unavailable
                    </div>
                  )}
                </div>
                <figcaption className="px-2 py-2 text-xs text-ink-soft">
                  {m.caption && <span className="block text-ink">{m.caption}</span>}
                  {m.author} &middot; {new Date(m.created_at).toLocaleDateString()}
                </figcaption>
                <DeleteMediaButton id={m.id} />
              </figure>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
