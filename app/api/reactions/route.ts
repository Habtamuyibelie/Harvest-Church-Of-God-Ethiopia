import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ALLOWED = new Set(["love", "like", "dislike"]);

// GET /api/reactions?issue_id=... → { love: 3, like: 5, dislike: 0, mine: "love" | null }
export async function GET(req: NextRequest) {
  const issueId = req.nextUrl.searchParams.get("issue_id");
  const clientId = req.nextUrl.searchParams.get("client_id");
  if (!issueId) return NextResponse.json({ error: "issue_id is required." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("newsletter_reactions")
    .select("reaction, client_id")
    .eq("issue_id", issueId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const counts = { love: 0, like: 0, dislike: 0 };
  let mine: string | null = null;
  for (const row of data || []) {
    if (row.reaction in counts) counts[row.reaction as keyof typeof counts]++;
    if (clientId && row.client_id === clientId) mine = row.reaction;
  }
  return NextResponse.json({ ...counts, mine });
}

// POST { issue_id, client_id, reaction } → sets/changes the caller's reaction (one per browser per issue)
export async function POST(req: NextRequest) {
  const { issue_id, client_id, reaction } = await req.json();
  if (!issue_id || !client_id || !ALLOWED.has(reaction))
    return NextResponse.json({ error: "issue_id, client_id, and a valid reaction are required." }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("newsletter_reactions")
    .upsert({ issue_id, client_id, reaction }, { onConflict: "issue_id,client_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE { issue_id, client_id } → removes the caller's reaction
export async function DELETE(req: NextRequest) {
  const { issue_id, client_id } = await req.json();
  if (!issue_id || !client_id)
    return NextResponse.json({ error: "issue_id and client_id are required." }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("newsletter_reactions")
    .delete().eq("issue_id", issue_id).eq("client_id", client_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
