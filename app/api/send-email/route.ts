import { NextRequest, NextResponse } from "next/server";
import {
  sendApplicationReceivedEmail,
  sendPaymentReceivedEmail,
  sendStatusApprovedEmail,
  sendStatusRejectedEmail,
  sendCancellationEmail,
  sendContactInquiryEmail,
} from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const action = req.nextUrl.searchParams.get("action");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tfmbmmtlppkzcxpndiym.supabase.co";
    const srvKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";

    if (action === "get_inquiries") {
      const res = await fetch(`${supabaseUrl}/rest/v1/contact_messages?order=created_at.desc&limit=100`, {
        headers: { apikey: srvKey, Authorization: `Bearer ${srvKey}` },
      });
      const data = await res.json();
      return NextResponse.json(Array.isArray(data) ? data : []);
    }

    if (action === "get_activity_log") {
      const res = await fetch(`${supabaseUrl}/rest/v1/admin_activity_log?order=created_at.desc&limit=100`, {
        headers: { apikey: srvKey, Authorization: `Bearer ${srvKey}` },
      });
      const data = await res.json();
      return NextResponse.json(Array.isArray(data) ? data : []);
    }

    return NextResponse.json({ message: "Academic Excellence Email API Active" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, to, name, refId, course, reason, rejectionReason, email, phone, subject, message } = body;

    const targetEmail = to || email;
    if (!targetEmail && type !== "contact_inquiry") {
      return NextResponse.json({ error: "Recipient email 'to' is required" }, { status: 400 });
    }

    let success = false;

    switch (type) {
      case "application_received":
        success = await sendApplicationReceivedEmail(targetEmail, name || "Applicant", refId, course || "Academic Program");
        break;

      case "payment_received":
        success = await sendPaymentReceivedEmail(targetEmail, name || "Applicant", refId);
        break;

      case "status_approved":
        success = await sendStatusApprovedEmail(targetEmail, name || "Applicant", refId, course || "Academic Program");
        break;

      case "status_rejected":
        success = await sendStatusRejectedEmail(targetEmail, name || "Applicant", refId, reason || rejectionReason);
        break;

      case "cancelled":
        success = await sendCancellationEmail(targetEmail, name || "Applicant", refId);
        break;

      case "contact_inquiry": {
        const safeName = (name || "Website Visitor").trim();
        const safeEmail = (email || to || "").trim();
        const safePhone = (phone || "").trim();
        const safeSubject = (subject || "General Inquiry").trim();
        const safeMessage = (message || "").trim();

        // 1. Insert into Supabase contact_messages using service role key
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tfmbmmtlppkzcxpndiym.supabase.co";
        const srvKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (srvKey) {
          try {
            await fetch(`${supabaseUrl}/rest/v1/contact_messages`, {
              method: "POST",
              headers: {
                apikey: srvKey,
                Authorization: `Bearer ${srvKey}`,
                "Content-Type": "application/json",
                Prefer: "return=minimal",
              },
              body: JSON.stringify({
                name: safeName,
                email: safeEmail,
                phone: safePhone || null,
                subject: safeSubject,
                message: safeMessage,
              }),
            });
          } catch (dbErr) {
            console.warn("DB insert contact error in Next route:", dbErr);
          }
        }

        // 2. Dispatch emails via Resend
        success = await sendContactInquiryEmail({
          name: safeName,
          email: safeEmail,
          phone: safePhone,
          subject: safeSubject,
          message: safeMessage,
        });
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 });
    }

    return NextResponse.json({ success });
  } catch (error: any) {
    console.error("Error in /api/send-email:", error);
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}
