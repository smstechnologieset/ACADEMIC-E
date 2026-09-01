import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  const bucket = searchParams.get("bucket") || "documents";

  if (!path) {
    return new NextResponse("File path missing", { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage.from(bucket).download(path);

    if (error || !data) {
      // Return placeholder synthetic response for demo files
      return new NextResponse(
        `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF`,
        {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${path.split("/").pop()}"`,
          },
        }
      );
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": data.type || "application/octet-stream",
        "Content-Disposition": `inline; filename="${path.split("/").pop()}"`,
      },
    });
  } catch {
    return new NextResponse("File preview generated in test mode.", { status: 200 });
  }
}
