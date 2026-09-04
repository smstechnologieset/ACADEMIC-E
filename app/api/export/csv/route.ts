import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: apps, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // CSV columns
    const headers = [
      "Reference ID",
      "Full Name",
      "Email",
      "Phone",
      "Course Applied",
      "Qualification",
      "Status",
      "Payment Method",
      "Transaction Ref",
      "Place",
      "Submission Date",
      "Last Updated",
    ];

    // Escape CSV values
    const escape = (val: string | null | undefined) => {
      if (!val) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = (apps || []).map((app) =>
      [
        app.id,
        app.full_name,
        app.email,
        app.phone,
        app.course_applied,
        app.qualification,
        app.status,
        app.payment_method,
        app.transaction_ref,
        app.place,
        app.submission_date,
        app.updated_at,
      ]
        .map(escape)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="academic-excellence-applications-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate CSV export" }, { status: 500 });
  }
}
