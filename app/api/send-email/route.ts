import { NextRequest, NextResponse } from "next/server";
import {
  sendApplicationReceivedEmail,
  sendPaymentReceivedEmail,
  sendStatusApprovedEmail,
  sendStatusRejectedEmail,
  sendCancellationEmail,
} from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, to, name, refId, course } = body;

    if (!to) {
      return NextResponse.json({ error: "Recipient email 'to' is required" }, { status: 400 });
    }

    let success = false;

    switch (type) {
      case "application_received":
        success = await sendApplicationReceivedEmail(to, name || "Applicant", refId, course || "Academic Program");
        break;

      case "payment_received":
        success = await sendPaymentReceivedEmail(to, name || "Applicant", refId);
        break;

      case "status_approved":
        success = await sendStatusApprovedEmail(to, name || "Applicant", refId, course || "Academic Program");
        break;

      case "status_rejected":
        success = await sendStatusRejectedEmail(to, name || "Applicant", refId);
        break;

      case "cancelled":
        success = await sendCancellationEmail(to, name || "Applicant", refId);
        break;

      default:
        return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 });
    }

    return NextResponse.json({ success });
  } catch (error: any) {
    console.error("Error in /api/send-email:", error);
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}
