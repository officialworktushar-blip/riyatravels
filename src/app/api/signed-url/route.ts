import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { path, bucket } = await request.json();

    if (!path || !bucket) {
      return NextResponse.json({ error: "Path and bucket are required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 300); // 5 minutes

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch {
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
  }
}
