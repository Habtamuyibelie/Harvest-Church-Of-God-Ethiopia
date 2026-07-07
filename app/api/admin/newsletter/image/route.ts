import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Reuses the same public "gallery-images" bucket, under a "newsletter/" prefix,
// so no extra bucket/storage policy is needed.
const BUCKET = "gallery-images";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (!file.type.startsWith("image/"))
    return NextResponse.json({ error: "File must be an image." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024)
    return NextResponse.json({ error: "Image must be under 8MB." }, { status: 400 });

  const ext = file.name.split(".").pop() || "jpg";
  const path = `newsletter/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
