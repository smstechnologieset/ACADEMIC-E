"use server";

import { revalidatePath } from "next/cache";
import { updateApplicationStatus } from "@/lib/applications-repo";
import { ApplicationStatus } from "@/types";

export async function processApplicationDecisionAction(
  applicationId: string,
  status: ApplicationStatus,
  internalNotes: string,
  applicantEmail: string,
  applicantName: string
) {
  try {
    // 1. Update database record
    await updateApplicationStatus(applicationId, status, internalNotes);

    revalidatePath("/admin/dashboard");
    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath("/");

    // 2. Trigger notification email (via Resend API or Edge Function)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const isApproved = status === "approved";
      const subject = isApproved
        ? "Congratulations! Your Academic E Application Has Been Approved"
        : "Academic E Application Status Update";

      const htmlBody = isApproved
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; color: #1e293b;">
            <h2 style="color: #0b1220;">Academic E Admissions Office</h2>
            <p>Dear ${applicantName},</p>
            <p>We are delighted to inform you that following careful review by the Admissions Committee, your application (Ref: <strong>${applicationId}</strong>) has been <strong>APPROVED</strong>.</p>
            <p>Our academic advisors will contact you shortly with enrollment onboarding, visa documentation details, and timetable scheduling.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
            <p style="font-size: 12px; color: #64748b;">Academic E Education Consultancy • Official Admissions Committee</p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; color: #1e293b;">
            <h2 style="color: #0b1220;">Academic E Admissions Office</h2>
            <p>Dear ${applicantName},</p>
            <p>Thank you for submitting your application (Ref: <strong>${applicationId}</strong>) for our academic programs.</p>
            <p>After thorough consideration, we regret to inform you that we are unable to offer you placement in this admissions intake cycle.</p>
            <p>We encourage you to strengthen your dossier and reapply during our subsequent intake.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
            <p style="font-size: 12px; color: #64748b;">Academic E Education Consultancy • Admissions Assessment Desk</p>
          </div>
        `;

      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Academic E <admissions@academice.org>",
            to: [applicantEmail],
            subject,
            html: htmlBody,
          }),
        });
      } catch (e) {
        console.warn("Failed to dispatch Resend email:", e);
      }
    } else {
      console.log(`[EMAIL SIMULATED] Notification sent to ${applicantEmail} (${applicantName}): ${status}`);
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process decision";
    return { success: false, error: msg };
  }
}
