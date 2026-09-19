/**
 * Email Notification System
 * Uses Resend API when RESEND_API_KEY is set, otherwise logs to console.
 */

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "Academic Excellence <admin@academicexcellences.com>";
const REPLY_TO_ADDRESS = process.env.RESEND_REPLY_TO || "solhm1@yahoo.com";

async function sendEmail(
  to: string | string[],
  subject: string,
  htmlBody: string,
  replyTo?: string | string[]
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[EMAIL SIMULATED] To: ${JSON.stringify(to)} | Subject: ${subject}`);
    console.log(`[EMAIL BODY]\n${htmlBody.replace(/<[^>]*>/g, "").substring(0, 200)}...`);
    return true;
  }

  try {
    const toArray = Array.isArray(to) ? to : [to];
    const replyToArray = replyTo ? (Array.isArray(replyTo) ? replyTo : [replyTo]) : [REPLY_TO_ADDRESS];

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: toArray,
        reply_to: replyToArray,
        subject,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.warn(`[EMAIL ERROR] Resend API returned ${res.status}: ${body}`);
      return false;
    }

    return true;
  } catch (err) {
    console.warn("[EMAIL ERROR] Failed to send email:", err);
    return false;
  }
}

// ─── Email Templates ─────────────────────────────────────────

const baseWrapper = (content: string) => `
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 28px 30px;">
    <h1 style="color: #ffffff; font-size: 20px; margin: 0; font-weight: 800; letter-spacing: -0.02em;">
      🎓 Academic Excellence
    </h1>
    <p style="color: #bfdbfe; font-size: 12px; margin: 6px 0 0 0;">Official Admissions Office</p>
  </div>
  <div style="padding: 30px; color: #1e293b; font-size: 14px; line-height: 1.7;">
    ${content}
  </div>
  <div style="padding: 20px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
    <p style="font-size: 11px; color: #94a3b8; margin: 0;">
      Academic Excellence Education Initiative • Powered by SMS Technologies<br/>
      Bole Sub-City, Education Hub, Addis Ababa, Ethiopia
    </p>
  </div>
</div>
`;

export async function sendApplicationReceivedEmail(
  to: string,
  name: string,
  refId: string,
  course: string
): Promise<boolean> {
  const subject = `Application Received — Reference ${refId}`;
  const html = baseWrapper(`
    <p>Dear <strong>${name}</strong>,</p>
    <p>Thank you for submitting your application to Academic Excellence. We have received your dossier and it is now being processed.</p>
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px;"><strong>Reference ID:</strong> <code style="background: #dbeafe; padding: 2px 8px; border-radius: 4px; font-size: 15px; font-weight: 700; color: #1e40af;">${refId}</code></p>
      <p style="margin: 8px 0 0 0; font-size: 13px;"><strong>Program:</strong> ${course}</p>
    </div>
    <p style="font-size: 13px;">📌 <strong>Save your Reference ID.</strong> You will need it to track your application status and complete payment verification.</p>
    <p style="font-size: 13px;">Next steps:</p>
    <ol style="font-size: 13px; padding-left: 20px;">
      <li>Complete your payment following the instructions on our website</li>
      <li>Upload your payment receipt/screenshot</li>
      <li>Track your status at <strong>academicexcellences.com/track</strong></li>
    </ol>
    <p style="font-size: 13px; color: #64748b;">If you have questions, reply to this email or contact our admissions desk.</p>
  `);

  return sendEmail(to, subject, html);
}

export async function sendPaymentReceivedEmail(
  to: string,
  name: string,
  refId: string
): Promise<boolean> {
  const subject = `Payment Received — Application ${refId} Under Review`;
  const html = baseWrapper(`
    <p>Dear <strong>${name}</strong>,</p>
    <p>We have received your payment submission for application <strong>${refId}</strong>. Your application is now <strong>Under Review</strong> by our Admissions Committee.</p>
    <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px;">⏳ <strong>Status:</strong> Under Review</p>
      <p style="margin: 8px 0 0 0; font-size: 13px;">Our team will verify your payment and review your academic credentials. This typically takes 2-5 business days.</p>
    </div>
    <p style="font-size: 13px;">You can track your application status anytime at <strong>academicexcellences.com/track</strong> using your Reference ID.</p>
  `);

  return sendEmail(to, subject, html);
}

export async function sendStatusApprovedEmail(
  to: string,
  name: string,
  refId: string,
  course: string
): Promise<boolean> {
  const subject = `🎉 Congratulations! Application ${refId} Approved`;
  const html = baseWrapper(`
    <p>Dear <strong>${name}</strong>,</p>
    <p>We are delighted to inform you that following careful review by the Admissions Committee, your application has been <strong style="color: #16a34a;">APPROVED</strong>.</p>
    <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px;">✅ <strong>Reference:</strong> ${refId}</p>
      <p style="margin: 8px 0 0 0; font-size: 13px;">📚 <strong>Program:</strong> ${course}</p>
      <p style="margin: 8px 0 0 0; font-size: 13px;">🎓 <strong>Status:</strong> Approved — Enrollment Confirmed</p>
    </div>
    <p style="font-size: 13px;">Our academic advisors will contact you shortly with:</p>
    <ul style="font-size: 13px; padding-left: 20px;">
      <li>Enrollment onboarding details</li>
      <li>Skillsoft Percipio platform credentials</li>
      <li>Timetable and study schedule</li>
    </ul>
    <p style="font-size: 13px; color: #64748b;">Welcome to Academic Excellence! We look forward to supporting your educational journey.</p>
  `);

  return sendEmail(to, subject, html);
}

export async function sendStatusRejectedEmail(
  to: string,
  name: string,
  refId: string,
  reason?: string
): Promise<boolean> {
  const subject = `Application Status Update — ${refId}`;
  const safeReason = reason
    ? reason
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
    : "";
  const html = baseWrapper(`
    <p>Dear <strong>${name}</strong>,</p>
    <p>Thank you for submitting your application (Ref: <strong>${refId}</strong>) for our academic programs.</p>
    <p>After thorough consideration by the Admissions Committee, we regret to inform you that we are unable to offer you placement in this admissions intake cycle.</p>
    ${safeReason ? `
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; padding: 18px 22px; border-radius: 0 8px 8px 0; margin: 20px 0;">
      <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Admissions Feedback / Reason for Rejection:</p>
      <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.6; font-weight: 500; white-space: pre-wrap;">${safeReason}</p>
    </div>
    ` : `
    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px;">We encourage you to strengthen your dossier and reapply during our subsequent intake period.</p>
    </div>
    `}
    <p style="font-size: 13px; color: #64748b;">You can track your application record or view feedback at any time on our <a href="https://www.academicexcellences.com/track.html?ref=${encodeURIComponent(refId)}" style="color: #df6b26; font-weight: 600;">Tracking Portal</a>.</p>
    <p style="font-size: 13px; color: #64748b;">If you believe this decision was made in error, please contact our admissions desk for further clarification.</p>
  `);

  return sendEmail(to, subject, html);
}

export async function sendCancellationEmail(
  to: string,
  name: string,
  refId: string
): Promise<boolean> {
  const subject = `Application Cancelled — ${refId}`;
  const html = baseWrapper(`
    <p>Dear <strong>${name}</strong>,</p>
    <p>This confirms that your application (Ref: <strong>${refId}</strong>) has been <strong>cancelled</strong> at your request.</p>
    <div style="background: #f8fafc; border-left: 4px solid #94a3b8; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px;">If you wish to apply again in the future, you are welcome to submit a new application through our website.</p>
    </div>
    <p style="font-size: 13px; color: #64748b;">Thank you for your interest in Academic Excellence.</p>
  `);

  return sendEmail(to, subject, html);
}

export async function sendContactInquiryEmail(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<boolean> {
  const safeName = (data.name || "Website Visitor").trim();
  const safeEmail = (data.email || "").trim();
  const safePhone = (data.phone || "").trim();
  const safeSubject = (data.subject || "General Inquiry").trim();
  const safeMessage = (data.message || "").trim();
  const charMap: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const escapedMessage = safeMessage.replace(/[&<>"']/g, (c: string) => charMap[c] || "");

  // 1. Send Notification to Admissions Desk
  const adminSubject = `📬 New Inquiry: ${safeSubject} — from ${safeName}`;
  const adminHtml = baseWrapper(`
    <p style="font-size: 16px; margin-top: 0; color: #0b1b3d;"><strong>New Website Inquiry Received</strong></p>
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 18px 22px; border-radius: 0 8px 8px 0; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>From:</strong> ${safeName}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #1d4ed8; font-weight: 600;">${safeEmail}</a></p>
      ${safePhone ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Phone:</strong> ${safePhone}</p>` : ""}
      <p style="margin: 0; font-size: 14px;"><strong>Subject / Track:</strong> ${safeSubject}</p>
    </div>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 18px 20px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Message Content:</p>
      <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #1e293b; white-space: pre-wrap;">${escapedMessage}</p>
    </div>
    <p style="font-size: 12px; color: #64748b;">💡 <em>You can reply directly to this email to respond to ${safeName} (${safeEmail}).</em></p>
  `);

  await sendEmail(
    ["admin@academicexcellences.com", "solhm1@yahoo.com"],
    adminSubject,
    adminHtml,
    safeEmail
  );

  // 2. Send Auto-Confirmation Receipt to Visitor
  if (safeEmail) {
    const userSubject = `Thank you for contacting Academic Excellence — We have received your message`;
    const userHtml = baseWrapper(`
      <p>Dear <strong>${safeName}</strong>,</p>
      <p>Thank you for reaching out to Academic Excellence. We have received your message regarding <strong>${safeSubject}</strong>.</p>
      <p>A member of our admissions and academic counseling team is reviewing your message and will reach out to you within 24 to 48 business hours.</p>
      <div style="background: #f8fafc; border-left: 4px solid #0b1b3d; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #0b1b3d; text-transform: uppercase;">Your Message Summary:</p>
        <p style="margin: 0; font-size: 13px; color: #475569; white-space: pre-wrap;">${safeMessage.slice(0, 300)}${safeMessage.length > 300 ? "..." : ""}</p>
      </div>
      <p style="font-size: 13px; color: #64748b; margin-top: 25px;">If you have any urgent questions, feel free to reply directly to this email or visit our website at <a href="https://www.academicexcellences.com" style="color: #2563eb; font-weight: 600;">academicexcellences.com</a>.</p>
    `);
    await sendEmail(safeEmail, userSubject, userHtml);
  }

  return true;
}

