import { NextResponse } from "next/server";

// Lightweight liveness endpoint for Docker HEALTHCHECK / uptime monitors.
// Deliberately does NOT touch Supabase — it should only report that the
// Node process itself is up and serving requests.
export async function GET() {
  return NextResponse.json({ status: "ok", time: new Date().toISOString() });
}
