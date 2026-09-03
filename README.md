# Our Space

A private, two-person website: a shared gallery for photos & videos, a weekly
timetable, and a personal diary for each of you (with the option to share a
page with your partner).

Nobody else can get in — there's a shared login for the two of you, and all
data is kept in your own private Supabase project, not on Anthropic's or
Claude's servers.

## How it's built

- **Next.js** (React) for the site itself.
- **Supabase** for the database and file storage — it has a free tier that's
  plenty for a couple's personal use.
- Login is a simple "pick your name + shared passcode" screen, not email/password
  accounts. It's meant for exactly two people who trust each other with one
  shared secret.

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com), sign up, and create a new project (free tier).
2. Once it's ready, open **SQL Editor** in the sidebar, paste the contents of
   `supabase/schema.sql` from this project, and run it. This creates the
   `media`, `timetable_entries`, and `diary_entries` tables, plus a private
   storage bucket called `memories`.
3. Open **Project Settings → API**. You'll need:
   - **Project URL** → `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** (under "Project API keys") → `SUPABASE_SERVICE_ROLE_KEY`
     — keep this secret, never put it in a client-facing file
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

A note on video size: Supabase's free tier caps individual file uploads
(50MB is the current default, and it's adjustable in **Storage → Settings**
up to what your plan allows). If you want to upload longer/higher-res videos,
either raise that limit there or upgrade your Supabase plan — the app itself
has no arbitrary size limit.

## 2. Set your environment variables

Copy `.env.example` to `.env.local` and fill it in:

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_PARTNER_A_NAME` / `NEXT_PUBLIC_PARTNER_B_NAME` — your two names,
  shown on the login screen and used to label things around the site.
- `SHARED_PASSCODE` — the one password you'll both use to log in.
- `SESSION_SECRET` — a random string used to sign the login cookie. Generate
  one with `openssl rand -base64 32` (or any long random string).
- The four Supabase values from step 1.

## 3. Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), pick your name, and log
in with the shared passcode.

## 4. Deploy it for real

The easiest path is [Vercel](https://vercel.com) (also free for personal projects):

1. Push this project to a GitHub repo (private, so no one else can see your code/config).
2. On Vercel, "Add New Project" → import that repo.
3. In the project's **Settings → Environment Variables**, add every variable
   from your `.env.local`.
4. Deploy. Vercel gives you a URL you can share with your partner, or connect
   your own domain later under **Settings → Domains**.

## How the pieces work

- **Gallery** — photos/videos upload directly from the browser straight into
  your private Supabase storage bucket (not through Vercel's servers), so
  large video files aren't blocked by serverless upload limits. Anyone signed
  in can see and remove anything in the shared gallery.
- **Timetable** — one shared weekly grid. Each entry can belong to one of you
  or to "Both," and is color-coded so it's easy to scan at a glance.
- **Diary** — entries are private to whoever wrote them by default. Each entry
  has a "Share with partner" toggle if you want your partner to be able to
  read a specific page; everything else stays just yours.

## Making it yours

- Colors, fonts, and copy live in `app/globals.css`, `app/layout.tsx`, and the
  page files under `app/` — change freely.
- Want more than a weekly repeating timetable (e.g. specific dates instead of
  a repeating week)? Add a `date` column to `timetable_entries` in Supabase
  and adjust the query in `app/timetable/page.tsx`.

## Security notes

- The Supabase **service role key** has full access to your database — it's
  only ever used in server-side code (`lib/supabase.ts`) and must never be
  exposed to the browser or committed somewhere public.
- Row Level Security is enabled on every table with no policies, so the
  public `anon` key genuinely can't read or write your data on its own — it's
  only ever used for the one-time signed upload URL your server hands out for
  each file.
- This is designed for two trusted people sharing one passcode, not for
  handling sensitive data at scale. If that ever changes, swap in real
  per-person accounts (Supabase Auth supports this well).
