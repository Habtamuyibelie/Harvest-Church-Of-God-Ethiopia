import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function sendWelcomeEmail(email: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "newsletter@harvestchurchethiopia.org";
  if (!key || key.startsWith("re_your")) return; // skip if not configured

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Welcome to Harvest Church Newsletter — መከር ቤተ-ክርስቲያን",
      html: `
        <div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#1a1a1a">
          <div style="background:#1B3F8B;padding:24px 32px">
            <h1 style="color:#E0A82E;margin:0;font-size:1.4rem">Harvest Church of God Ethiopia</h1>
            <p style="color:#fff;opacity:.8;margin:4px 0 0;font-size:.85rem">መከር የእግዚአብሔር ቤተ-ክርስቲያን ኢትዮጲያ</p>
          </div>
          <div style="padding:32px">
            <h2 style="color:#C32A2E">Welcome to the family! 🙏</h2>
            <p>Thank you for subscribing to our newsletter. You'll receive monthly updates on sermons, events, and stories from our church community.</p>
            <p style="color:#555;font-size:.9rem">If you didn't sign up for this, you can safely ignore this email.</p>
          </div>
          <div style="background:#f5f5f5;padding:16px 32px;font-size:.8rem;color:#888;text-align:center">
            © ${new Date().getFullYear()} Harvest Church of God, Ethiopia
          </div>
        </div>
      `,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRe.test(email)) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    // Upsert — reactivates unsubscribed users
    const { error } = await supabaseAdmin
      .from("subscribers")
      .upsert({ email: email.toLowerCase(), status: "active" }, { onConflict: "email" });

    if (error) throw error;

    await sendWelcomeEmail(email);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe API error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
