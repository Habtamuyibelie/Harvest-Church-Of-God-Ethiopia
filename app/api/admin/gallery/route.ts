import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "gallery-images";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("gallery_images").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach public URLs
  const images = data.map((img) => ({
    ...img,
    url: supabaseAdmin.storage.from(BUCKET).getPublicUrl(img.storage_path).data.publicUrl,
  }));
  return NextResponse.json(images);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file  = formData.get("file") as File;
  const album   = (formData.get("album") as string) || "General";
  const caption = (formData.get("caption") as string) || "";

  if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

  const ext  = file.name.split(".").pop();
  const path = `${album.toLowerCase().replace(/\s+/g, "-")}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data, error } = await supabaseAdmin
    .from("gallery_images").insert({ album, caption, storage_path: path }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ...data,
    url: supabaseAdmin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
  });
}

export async function DELETE(req: NextRequest) {
  const { id, storage_path } = await req.json();

  await supabaseAdmin.storage.from(BUCKET).remove([storage_path]);
  const { error } = await supabaseAdmin.from("gallery_images").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
