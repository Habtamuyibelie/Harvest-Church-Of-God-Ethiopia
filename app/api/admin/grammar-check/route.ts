import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies to LanguageTool's free public API (no key required for
 * reasonable low-volume use). Protected implicitly by middleware.ts
 * since this route lives under /api/admin/**.
 */
export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const params = new URLSearchParams({ text, language: "en-US" });
    const res = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Grammar check service unavailable." }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ matches: data.matches || [] });
  } catch {
    return NextResponse.json({ error: "Grammar check failed." }, { status: 500 });
  }
}
