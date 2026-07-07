import { createClient } from "@supabase/supabase-js";

/**
 * Public Supabase client — uses the publishable (anon) key.
 * Safe to import from both Client Components and Server Components.
 * Reads are governed by the public RLS policies in supabase/schema.sql
 * (events, gallery_images, newsletter_issues are readable by anyone).
 */
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false } }
);
