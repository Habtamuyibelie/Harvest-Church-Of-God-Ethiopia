import { NextRequest, NextResponse } from "next/server";
import { marked } from "marked";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("newsletter_issues").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, amharic, tag, preview, content, image_url, author_name } = body;
  if (!title || !preview || !content)
    return NextResponse.json({ error: "title, preview and content are required." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("newsletter_issues")
    .insert({ title, amharic, tag: tag || "Church Life", preview, content, image_url, author_name, published: false })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { id, ...updates } = await req.json();

  // If publishing and Resend is configured, send to all active subscribers
  if (updates.published === true) {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || "newsletter@harvestchurchethiopia.org";
    if (key && !key.startsWith("re_your")) {
      const { data: subs } = await supabaseAdmin
        .from("subscribers").select("email").eq("status", "active");
      const { data: issue } = await supabaseAdmin
        .from("newsletter_issues").select("*").eq("id", id).single();

      if (subs && issue) {
        for (const sub of subs) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
            body: JSON.stringify({
              from, to: sub.email,
              subject: `${issue.title} — Harvest Church of God Ethiopia`,
              html: `
                <div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#1a1a1a">
                  <div style="background:#1B3F8B;padding:24px 32px">
                    <h1 style="color:#E0A82E;margin:0;font-size:1.3rem">Harvest Church of God Ethiopia</h1>
                  </div>
                  <div style="padding:32px">
                    <p style="color:#C32A2E;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em">${issue.tag}</p>
                    <h2>${issue.title}</h2>
                    ${issue.amharic ? `<p style="color:#888;font-style:italic">${issue.amharic}</p>` : ""}
                    ${issue.author_name ? `<p style="color:#999;font-size:.8rem;margin-top:-8px">By ${issue.author_name}</p>` : ""}
                    <div>${marked.parse(issue.content || "")}</div>
                  </div>
                  <div style="background:#f5f5f5;padding:16px 32px;font-size:.75rem;color:#999;text-align:center">
                    © ${new Date().getFullYear()} Harvest Church of God, Ethiopia
                  </div>
                </div>`,
            }),
          });
        }
      }
    }
  }

  const { data, error } = await supabaseAdmin
    .from("newsletter_issues").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const { error } = await supabaseAdmin.from("newsletter_issues").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
