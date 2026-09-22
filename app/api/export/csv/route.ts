import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const course = searchParams.get("course");
    const qualification = searchParams.get("qualification");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let query = supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (course && course !== "all") {
      query = query.ilike("course_applied", course);
    }
    if (qualification && qualification !== "all") {
      query = query.ilike("qualification", qualification);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (from) {
      query = query.gte("created_at", from);
    }
    if (to) {
      query = query.lte("created_at", `${to}T23:59:59.999Z`);
    }

    const { data: apps, error } = await query;

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

    const csv = "\ufeff" + [headers.join(","), ...rows].join("\r\n");

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
