# Harvest Church of God Ethiopia — Website

Next.js 14 (App Router) + Tailwind + Supabase. Package-manager agnostic —
use `bun` or `npm`, both work.

## Structure

```
app/
  page.tsx                 Home (dynamic — pulls next 3 events)
  about/ contact/ programs/ donate/ gallery/ newsletter/    Public pages
  sermons/                 Public sermons list (dynamic, YouTube thumbnails)
  events/                  Public events list (dynamic)
  admin/
    page.tsx                Admin login (real Supabase Auth)
    dashboard/page.tsx       Manage messages, subscribers, newsletter,
                              gallery, events, sermons
    profile/page.tsx          Change display name / password
  api/
    contact/route.ts         POST — public: save a contact message
    subscribe/route.ts        POST — public: subscribe + welcome email
    reactions/route.ts         GET/POST/DELETE — public: love/like/dislike
                                a newsletter issue (one per browser)
    admin/                     Every route here is protected by
                                middleware.ts — no per-route auth code needed
      events/route.ts           GET/POST/PATCH/DELETE
      sermons/route.ts           GET/POST/PATCH/DELETE
      gallery/route.ts            GET/POST/DELETE
      newsletter/route.ts          GET/POST/PATCH/DELETE — publishing an
                                    issue emails every active subscriber
      messages/route.ts             GET/PATCH/DELETE — contact inbox
      subscribers/route.ts           GET/DELETE
      grammar-check/route.ts          POST — proxies LanguageTool's free API

middleware.ts               Runs before every /admin/** and /api/admin/**
                             request. No valid Supabase Auth session → the
                             page redirects to /admin, the API 401s. This
                             (not the navbar, not the URL) is what actually
                             keeps the admin area private.

components/
  Navbar, Footer, ThemeProvider/Toggle, SiteBackground, WovenBorder
  NewsletterReactions.tsx    Love/like/dislike buttons on newsletter cards
  admin/SpellcheckField.tsx   Textarea with native spellcheck + a
                              "Check grammar & spelling" button (LanguageTool)

lib/
  supabase/
    public.ts                 Publishable-key client — public reads,
                                safe in both client & server components
    admin.ts                   Service-role client — server-only,
                                bypasses RLS, used by every /api/admin/*
                                route and the two public write routes
    server.ts                  Cookie-aware client — reads the real
                                 logged-in admin's session (Server
                                 Components, middleware)
    browser.ts                 Cookie-aware client for Client Components
                                 (sign in, sign out, change password)

supabase/
  schema.sql                  Full schema: tables, RLS policies,
                               storage bucket — paste into the Supabase
                               SQL editor once (safe to re-run any time)
```

## How the backend is wired

- **Public data** (events, sermons, gallery, published newsletter issues,
  reaction counts) is read directly from Supabase using the publishable
  key, governed by Row Level Security — no API route needed for reads.
- **Public writes** (contact form, newsletter subscribe, reactions) go
  through their own API routes, which use the **service role** key so
  they always succeed regardless of RLS, with server-side validation.
- **Admin accounts are real Supabase Auth users** — there is no shared
  password baked into `.env`. Create/remove admins any time from the
  Supabase dashboard: **Authentication → Users → Add user**. Sign in at
  `/admin` with that email + password.
- **Admin area security**: `middleware.ts` checks the Supabase Auth
  session on *every* request to `/admin/**` and `/api/admin/**`, before
  any page or data is returned. A visitor who is not signed in gets
  redirected/401'd immediately — nothing is exposed by "hiding" the URL.
  Individual routes don't need their own auth checks.
- **Grammar & spelling**: `SpellcheckField` enables the browser's native
  spellcheck on long-text fields (newsletter content, sermon notes) and
  has a "Check grammar & spelling" button that calls LanguageTool's free
  public API server-side via `/api/admin/grammar-check` (no API key
  needed for normal admin usage volumes).
- **Newsletter reactions**: each browser gets a random ID stored in
  `localStorage`; reacting upserts one row per `(issue, browser)` so a
  visitor's choice can be changed but not duplicated.
- **Newsletter sending**: publishing an issue in the dashboard emails all
  `active` subscribers via the Resend REST API (`RESEND_API_KEY`,
  `EMAIL_FROM`). New subscribers also get a welcome email.

## Setup

1. Create a Supabase project → Project Settings → API → copy the URL and
   publishable (or anon) key, and the service role key.
2. Open the SQL Editor in Supabase and run `supabase/schema.sql`.
3. Create your first admin: Supabase dashboard → **Authentication → Users
   → Add user** → set an email + password (check "Auto Confirm User").
4. Copy `.env.local.example` to `.env.local` and fill in real values
   (Supabase keys + optionally a Resend API key for outbound email).
5. Install and run:

```bash
bun install
bun dev
```

Open http://localhost:3000 — and http://localhost:3000/admin to sign in
with the Supabase Auth user you created in step 3.

## Design

- **Palette:** logo-derived deep indigo, gold, red, blue — theme-aware via
  CSS variables in `app/globals.css`, switching instantly with the sun/moon
  toggle in the navbar (persisted to `localStorage`).
- **Type:** Fraunces (display serif) + Source Sans 3 (body).
- **Signature motif:** a woven border pattern (`components/WovenBorder.tsx`)
  inspired by Ethiopian habesha textile borders, framing the top and
  bottom of every page.

## Troubleshooting: "I created an event/sermon in the dashboard but it's not showing on the public page"

The admin dashboard writes with the **service role** key, which bypasses
Row Level Security — so a row can exist in the database while the public
page (which reads with the restricted publishable key) still sees nothing.
Every public page now shows the real Supabase error on-screen instead of
failing silently, so start there. The usual causes:

1. **`supabase/schema.sql` hasn't been (re-)run**, or an older copy of it
   was run before `is_published`/RLS policies existed. Re-run the current
   `supabase/schema.sql` — it's idempotent, safe to run any time.
2. Quick manual check — run this in the Supabase SQL editor:
   ```sql
   select id, title, is_published from events;
   select id, title, is_published from sermons;
   ```
   If rows exist but `is_published` is `false`/`null`, that's the RLS
   policy correctly hiding them — check the admin insert.
3. Confirm the read policies exist:
   ```sql
   select tablename, policyname, cmd from pg_policies
   where tablename in ('events','sermons','gallery_images','newsletter_issues');
   ```

## Recent additions

- **Modern toast notifications, app-wide**: `components/Toast.tsx` — a
  stacking, animated notification system (success/error/info, icon,
  auto-dismiss progress bar) now used on every form: admin dashboard,
  contact, and newsletter subscribe. Every form also highlights the
  *specific* invalid field with a red border and inline message instead
  of just a generic error.
- **Calendar date picker**: `components/admin/DatePicker.tsx` replaces
  the native date input for events and sermons — a proper month-grid
  calendar. Event dates cannot be in the past (disabled in the picker
  *and* rejected server-side); the public `/events` page now only shows
  today-or-future events.
- **Sermons play inline** — clicking a sermon opens an embedded YouTube
  player right on the site (`components/SermonsGrid.tsx`) instead of
  redirecting to youtube.com.
- **Admin events list now shows a Live/Hidden badge** and flags past
  dates, so it's obvious at a glance why something isn't showing up
  publicly without needing to check Supabase directly.

- **Markdown editor for newsletter content**: `MarkdownField` — a small
  toolbar (bold/italic/heading/lists/quote/link), a live preview toggle,
  and the same grammar/spellcheck button. Full issue content now renders
  as real formatted markdown on the public page (and in the notification
  email) instead of raw text.
- **Newsletter cover images**: upload an image directly when writing an
  issue (`/api/admin/newsletter/image`, stored in the same `gallery-images`
  bucket under `newsletter/`).
- **"Read More" now shows the full formatted article**, and the card
  expands to full width in the grid for a comfortable reading layout.
- **Gallery uploads now take a category (album) and a title (caption)**
  at upload time — previously everything silently went into "General"
  with no way to label it from the UI.

- **Validation & error handling**: every admin dashboard action (create/
  delete/publish/upload) now validates required fields client-side and
  shows a red error toast with the real server message on failure,
  instead of failing silently. Public pages (events, sermons, gallery,
  newsletter) show the actual Supabase error inline if a fetch fails.
- **Newsletter publisher name**: newsletter issues have an optional
  "Published by" field, shown on the public card and in the notification
  email.
- **Social links**: `lib/social-links.ts` — one file to edit with your
  real Facebook/YouTube/Telegram/Instagram/TikTok URLs; the footer renders
  whichever ones have a URL set.
- **SEO**: per-page metadata, Open Graph + Twitter cards, a Church
  JSON-LD block on the home page, and auto-generated `/sitemap.xml` +
  `/robots.txt`. Set `NEXT_PUBLIC_SITE_URL` in `.env.local` to your real
  domain once you have one.
- **Definitive events visibility check**: the admin Events tab now runs a
  live comparison — "how many published, upcoming events does the admin
  see" vs. "how many can the public actually read with the anon key" —
  and shows a clear green/red banner explaining exactly what's wrong
  (RLS not applied, or just needing a redeploy) instead of leaving you to
  guess.
- **Home page "Latest Sermons / Recent messages" is now real data** — it
  was still hardcoded to 3 fake sermons; it now shows your 3 most recent
  published sermons and links through to `/sermons`.

## Docker (production)

The app builds into a non-root Docker image that runs `bun run start`
(i.e. `next start`) — the exact same command you'd use locally — with a
`/api/health` endpoint for container health checks.

Note: this image does **not** use Next's `output: "standalone"` mode.
That mode is only for containers and is incompatible with `next start` /
`bun run start` (Next.js will refuse to run and error with missing
`sharp`/broken image optimization if you mix the two) — so it's
deliberately left off here to keep local and containerized behavior
identical.

**Important**: `NEXT_PUBLIC_*` variables are compiled directly into the
browser JS bundle at **build time** — they must be the real values when
you build the image, not placeholders. The other variables
(`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`) are
server-only and are read fresh every time the container starts, so they
just need *some* value at build time and the real value at `docker run`.

### Quick start with docker-compose (recommended)

```bash
cp .env.local.example .env.local   # fill in real values
docker compose up --build -d
```

`docker-compose.yml` reads `NEXT_PUBLIC_*` from your shell/`.env` for the
build args, and loads the rest from `.env.local` at runtime.

### Or plain Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key \
  --build-arg NEXT_PUBLIC_SITE_URL=https://your-real-domain.com \
  -t harvest-church-web .

docker run -d -p 3000:3000 --env-file .env.local --name harvest-church harvest-church-web
```

Visit http://localhost:3000. `docker logs -f harvest-church` shows the
same Next.js server output you'd see locally.

### Notes for a real production deployment

- Put the container behind a reverse proxy (Caddy/Nginx/Traefik) that
  terminates HTTPS — the container itself only serves plain HTTP on 3000.
- `NEXT_PUBLIC_SITE_URL` should match whatever domain that proxy serves,
  since it feeds the sitemap, robots.txt, and Open Graph metadata.
- Rebuild and redeploy the image any time a `NEXT_PUBLIC_*` value changes
  (they can't be updated by just restarting the container).
- For faster self-hosted image optimization, you can add `sharp` to
  `dependencies` — optional, Next.js falls back to a slower built-in
  optimizer without it.

## Pushing to Git

The repo is git-ready:
- `.gitignore` excludes `node_modules`, `.next`, build caches, and every
  `.env*.local` file — your real Supabase/Resend keys never get committed.
- `.env.local.example` is tracked instead, so anyone cloning the repo
  knows exactly which variables to set.
- Nothing else in the tree contains secrets.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Then set the same environment variables (from `.env.local`) in your
hosting provider's dashboard (Vercel/Netlify/etc.) — `.env.local` itself
never gets pushed.
