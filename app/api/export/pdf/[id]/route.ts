import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createAdminClient } from "@/lib/supabase/server";
import { ApplicationDossierPdf } from "@/lib/pdf/dossier-template";
import type { Application, ApplicationEvent } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Fetch application
    const { data: app, error } = await supabase
      .from("applications")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Fetch timeline events
    const { data: events } = await supabase
      .from("application_events")
      .select("*")
      .eq("application_id", id)
      .order("created_at", { ascending: true });

    // Fetch fee from settings
    const { data: settingsRow } = await supabase
      .from("cms_site_settings")
      .select("data")
      .eq("id", "site_config")
      .single();

    const fee = settingsRow?.data?.applicationFee || "";

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      ApplicationDossierPdf({
        application: app as Application,
        events: (events || []) as ApplicationEvent[],
        fee,
      })
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="dossier-${id}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
