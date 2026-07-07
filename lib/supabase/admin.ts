import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client — uses the SERVICE ROLE key and bypasses Row Level
 * Security entirely. Never import this into a Client Component; the
 * `server-only` guard above will throw a build error if you try.
 *
 * Used by:
 *  - app/api/admin/**  (protected by middleware.ts, which checks the
 *    real Supabase Auth session — see lib/supabase/server.ts)
 *  - app/api/contact, app/api/subscribe, app/api/reactions (public write endpoints)
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
