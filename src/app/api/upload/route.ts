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

    const allowedBuckets = ["vehicle-images", "scanner-qr", "licenses", "payment-proofs", "site-content"];
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
      return NextResponse.json(
        { error: `Upload failed: ${error.message ?? "unknown error"}` },
        { status: 500 }
      );
    }

    // For public buckets, return the public URL
    if (bucket === "vehicle-images" || bucket === "scanner-qr" || bucket === "site-content") {
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      return NextResponse.json({ path: data.path, url: urlData.publicUrl });
    }

    return NextResponse.json({ path: data.path });
  } catch (err) {
    console.error("Upload API error:", err);
    const message =
      err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }
}
