import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;

    if (!file || !bucket) {
      return NextResponse.json({ error: "File and bucket are required" }, { status: 400 });
    }

    const allowedBuckets = ["vehicle-images", "scanner-qr", "licenses", "payment-proofs"];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: file.type });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // For public buckets, return the public URL
    if (bucket === "vehicle-images" || bucket === "scanner-qr") {
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      return NextResponse.json({ path: data.path, url: urlData.publicUrl });
    }

    return NextResponse.json({ path: data.path });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
