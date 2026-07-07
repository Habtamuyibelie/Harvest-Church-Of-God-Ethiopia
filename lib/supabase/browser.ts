import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client — used only for Supabase Auth actions
 * (sign in, sign out, change password/email) from Client Components.
 * Session cookies are written automatically and picked up by
 * middleware.ts + lib/supabase/server.ts on the next request.
 */
export const supabaseBrowser = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
