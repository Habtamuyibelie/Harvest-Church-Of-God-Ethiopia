import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Auth is enforced centrally by middleware.ts (matcher: /api/admin/:path*)
// — every request that reaches this file already has a valid admin session.

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("sermons").select("*").order("sermon_date", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, pastor_name, sermon_date, youtube_url, description } = body;
  if (!title || !pastor_name || !sermon_date)
    return NextResponse.json({ error: "title, pastor_name, and sermon_date are required." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("sermons")
    .insert({ title, pastor_name, sermon_date, youtube_url, description, is_published: true })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { id, ...updates } = await req.json();
  const { data, error } = await supabaseAdmin
    .from("sermons").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const { error } = await supabaseAdmin.from("sermons").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
