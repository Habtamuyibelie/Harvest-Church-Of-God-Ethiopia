import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Runs before every request to /admin/** and /api/admin/**.
 * No valid Supabase Auth session → redirected (pages) or 401'd (API)
 * before any HTML or data is ever sent. This is what makes the admin
 * area actually private, not just "not linked from the navbar".
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin";
  const isAdminPage = pathname.startsWith("/admin") && !isLoginPage;
  const isAdminApi  = pathname.startsWith("/api/admin");

  if (!user && isAdminApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user && isAdminPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  if (user && isLoginPage) {
    // Already signed in — skip straight to the dashboard.
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
