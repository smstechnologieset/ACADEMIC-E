/**
 * Academic Excellence — Serverless Email Notification Handler
 * Compatible with Vercel Serverless Functions (Node.js)
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "Academic Excellence <admin@academicexcellences.com>";
const REPLY_TO_ADDRESS = process.env.RESEND_REPLY_TO || "imkingya69@gmail.com";

const baseWrapper = (content) => `
<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
  <div style="background: linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%); padding: 32px 30px; text-align: left;">
    <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
      🎓 Academic Excellence
    </div>
    <div style="color: #93c5fd; font-size: 13px; margin-top: 6px; font-weight: 500;">
      Education Initiative &amp; Admissions Office
    </div>
  </div>
  <div style="padding: 32px 30px; color: #1e293b; font-size: 15px; line-height: 1.7;">
    ${content}
  </div>
  <div style="padding: 24px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
    <p style="font-size: 12px; color: #64748b; margin: 0 0 6px 0;">
      Academic Excellence Education Initiative • Powered by <a href="https://smstechnologieset.com/" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 600;">SMS Technologies</a>
    </p>
    <p style="font-size: 11px; color: #94a3b8; margin: 0;">
      Bole Sub-City, Education Hub, Addis Ababa, Ethiopia • official inquiries: admin@academicexcellences.com
    </p>
  </div>
</div>
`;

async function sendEmail(to, subject, htmlBody, customReplyTo = null) {
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL SIMULATED] To: ${to} | Subject: ${subject}`);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: Array.isArray(to) ? to : [to],
        reply_to: customReplyTo ? [customReplyTo] : [REPLY_TO_ADDRESS],
        subject,
        html: htmlBody
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[EMAIL ERROR] Resend returned ${res.status}: ${errText}`);
      return false;
    }

    const data = await res.json();
    console.log(`[EMAIL SENT] ID: ${data.id} To: ${to}`);
    return true;
  } catch (err) {
    console.error("[EMAIL ERROR] Exception sending email:", err);
    return false;
  }
}

module.exports = async function handler(req, res) {
  // 1. Enable CORS for all environments
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const host = req.headers ? (req.headers.host || "localhost") : "localhost";
  const urlObj = new URL(req.url, `http://${host}`);
  const actionParam = urlObj.searchParams.get("action");

  // Server-side fallback for reading inquiries and activity logs using service role key
  if (req.method === "GET" || actionParam) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tfmbmmtlppkzcxpndiym.supabase.co";
    const srvKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";

    if (actionParam === "get_inquiries") {
      try {
        const r = await fetch(`${supabaseUrl}/rest/v1/contact_messages?order=created_at.desc&limit=100`, {
          headers: { "apikey": srvKey, "Authorization": `Bearer ${srvKey}` }
        });
        const rows = await r.json();
        return res.status(200).json(Array.isArray(rows) ? rows : []);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    if (actionParam === "get_activity_log") {
      try {
        const r = await fetch(`${supabaseUrl}/rest/v1/admin_activity_log?order=created_at.desc&limit=100`, {
          headers: { "apikey": srvKey, "Authorization": `Bearer ${srvKey}` }
        });
        const rows = await r.json();
        return res.status(200).json(Array.isArray(rows) ? rows : []);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { type, to, name, refId, course, reason, rejectionReason } = body;

    if (!to && type !== "contact_inquiry") {
      return res.status(400).json({ error: "Recipient email 'to' is required." });
    }

    const safeName = (name || "Applicant").trim();
    const safeRef = (refId || "").trim();
    const safeCourse = (course || "Selected Academic Program").trim();

    let success = false;

    switch (type) {
      case "application_received": {
        const subject = `Application Received — Reference ${safeRef}`;
        const html = baseWrapper(`
          <p>Dear <strong>${safeName}</strong>,</p>
          <p>Thank you for submitting your application to Academic Excellence. Your application has been received and securely registered in our admissions system.</p>
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 18px 22px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <p style="margin: 0; font-size: 13px; color: #1e3a8a;"><strong>YOUR APPLICATION REFERENCE ID:</strong></p>
            <p style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800; font-family: monospace; color: #1d4ed8; letter-spacing: 1px;">${safeRef}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #334155;"><strong>Program Track:</strong> ${safeCourse}</p>
          </div>
          <p style="font-size: 14px;">📌 <strong>Important: Please save your Reference ID.</strong> You will need it to upload your payment transfer slip and track your application status in real-time.</p>
          <p style="font-size: 14px; font-weight: 600; margin-top: 20px;">Next Steps to Finalize Your Admissions:</p>
          <ol style="font-size: 14px; padding-left: 20px; line-height: 1.8;">
            <li>Transfer your subsidized intake fee (15,000 ETB) via Telebirr, CBE Bank, CBE Birr, or Awash Bank.</li>
            <li>Upload your payment receipt screenshot or bank slip on our portal.</li>
            <li>Track your application progress anytime at <a href="https://academicexcellences.com/track.html" style="color: #2563eb; font-weight: 600;">academicexcellences.com/track.html</a>.</li>
          </ol>
          <p style="font-size: 13px; color: #64748b; margin-top: 25px;">If you have any questions or require assistance, please reply directly to this email or contact our admissions desk.</p>
        `);
        success = await sendEmail(to, subject, html);
        break;
      }

      case "payment_received": {
        const subject = `Payment Received — Application ${safeRef} Under Review`;
        const html = baseWrapper(`
          <p>Dear <strong>${safeName}</strong>,</p>
          <p>We have successfully received your payment proof submission for Application <strong>${safeRef}</strong>. Your dossier is now officially <strong>Under Review</strong> by the Admissions Committee.</p>
          <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 18px 22px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <p style="margin: 0; font-size: 13px; color: #854d0e;"><strong>Application Reference:</strong> ${safeRef}</p>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #854d0e;"><strong>Verification Status:</strong> Verification in progress</p>
          </div>
          <p style="font-size: 14px;">Our admissions officers verify all bank and mobile transfer receipts directly against official institutional records. You will receive a final status notification once your credentials and payment verification are finalized.</p>
          <p style="font-size: 14px;">You can monitor the live progress of your review at any time on our tracking page: <a href="https://academicexcellences.com/track.html?ref=${encodeURIComponent(safeRef)}" style="color: #2563eb; font-weight: 600;">Track Application</a>.</p>
          <p style="font-size: 13px; color: #64748b; margin-top: 25px;">Thank you for your diligence!</p>
        `);
        success = await sendEmail(to, subject, html);
        break;
      }

      case "status_approved": {
        const subject = `🎉 Congratulations! Your Application is Approved — ${safeRef}`;
        const html = baseWrapper(`
          <p>Dear <strong>${safeName}</strong>,</p>
          <p>Congratulations! We are delighted to inform you that your application for admission has been officially <strong>Approved and Confirmed</strong>.</p>
          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 18px 22px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; font-weight: 700; color: #065f46;">ADMISSION ENROLLMENT CONFIRMED</p>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #334155;"><strong>Reference:</strong> ${safeRef} • <strong>Program:</strong> ${safeCourse}</p>
          </div>
          <p style="font-size: 14px;">Our student success team will contact you shortly with your official credentials for the Skillsoft Percipio learning platform, curriculum syllabus, and orientation timetable.</p>
          <p style="font-size: 13px; color: #64748b; margin-top: 25px;">Welcome to Academic Excellence! We look forward to supporting your educational journey.</p>
        `);
        success = await sendEmail(to, subject, html);
        break;
      }

      case "status_rejected": {
        const rawReason = (reason || rejectionReason || "").trim();
        const safeReason = rawReason.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
        const subject = `Application Status Update — ${safeRef}`;
        const html = baseWrapper(`
          <p>Dear <strong>${safeName}</strong>,</p>
          <p>Thank you for submitting your application (Ref: <strong>${safeRef}</strong>) for ${safeCourse ? `<strong>${safeCourse}</strong>` : "our academic programs"}.</p>
          <p>After thorough review by the Admissions Committee, we regret to inform you that we are unable to offer you placement for this specific intake cycle.</p>
          ${safeReason ? `
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; padding: 18px 22px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Admissions Feedback / Reason for Rejection:</p>
            <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.6; font-weight: 500; white-space: pre-wrap;">${safeReason}</p>
          </div>
          ` : `
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 18px 22px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <p style="margin: 0; font-size: 13px; color: #991b1b;">We encourage you to bolster your credentials and consider reapplying during our subsequent intake period.</p>
          </div>
          `}
          <p style="font-size: 13px; color: #64748b; margin-top: 25px;">You can review your application record and feedback anytime on our <a href="https://www.academicexcellences.com/track.html?ref=${encodeURIComponent(safeRef)}" style="color: #df6b26; font-weight: 600;">Tracking Portal</a>.</p>
          <p style="font-size: 13px; color: #64748b;">If you have questions or require further clarification, please contact our admissions office.</p>
        `);
        success = await sendEmail(to, subject, html);
        break;
      }

      case "cancelled": {
        const subject = `Application Cancelled — ${safeRef}`;
        const html = baseWrapper(`
          <p>Dear <strong>${safeName}</strong>,</p>
          <p>This confirms that your application (Ref: <strong>${safeRef}</strong>) has been successfully <strong>cancelled</strong> at your request.</p>
          <div style="background: #f8fafc; border-left: 4px solid #94a3b8; padding: 18px 22px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <p style="margin: 0; font-size: 13px; color: #475569;">If you wish to apply again in the future, you are always welcome to submit a new application on our website.</p>
          </div>
          <p style="font-size: 13px; color: #64748b; margin-top: 25px;">Thank you for your interest in Academic Excellence.</p>
        `);
        success = await sendEmail(to, subject, html);
        break;
      }

      case "contact_inquiry": {
        const safeEmail = (body.email || to || "").trim();
        const safeSubject = (body.subject || "General Inquiry").trim();
        const safePhone = (body.phone || "").trim();
        const safeMessage = (body.message || "").trim();

        // 1. Persist directly into Supabase contact_messages table via serverless service role key
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tfmbmmtlppkzcxpndiym.supabase.co";
        const srvKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (srvKey) {
          try {
            await fetch(`${supabaseUrl}/rest/v1/contact_messages`, {
              method: "POST",
              headers: {
                "apikey": srvKey,
                "Authorization": `Bearer ${srvKey}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
              },
              body: JSON.stringify({
                name: safeName,
                email: safeEmail,
                phone: safePhone || null,
                subject: safeSubject,
                message: safeMessage
              })
            });
          } catch (dbErr) {
            console.warn("DB insert contact error:", dbErr);
          }
        }

        // 2. Send Alert Notification to Admin Desk with custom reply-to set to visitor's email
        const adminSubject = `📬 New Inquiry: ${safeSubject} — from ${safeName}`;
        const escapedMessage = safeMessage.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
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
          <p style="font-size: 12px; color: #64748b;">💡 <em>You can reply directly to this email to respond directly to ${safeName} (${safeEmail}).</em></p>
        `);

        // Send to official administrative inbox and backup notification address
        await sendEmail(["admin@academicexcellences.com", "imkingya69@gmail.com"], adminSubject, adminHtml, safeEmail);

        // 3. Send Auto-Confirmation Receipt to Visitor
        if (safeEmail) {
          const userSubject = `Thank you for contacting Academic Excellence — We have received your message`;
          const userHtml = baseWrapper(`
            <p>Dear <strong>${safeName}</strong>,</p>
            <p>Thank you for reaching out to Academic Excellence. We have received your inquiry regarding <strong>${safeSubject}</strong>.</p>
            <p>A member of our admissions and academic counseling desk is reviewing your message and will reach out to you within 24 to 48 business hours.</p>
            <div style="background: #f8fafc; border-left: 4px solid #0b1b3d; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #0b1b3d; text-transform: uppercase;">Your Message Summary:</p>
              <p style="margin: 0; font-size: 13px; color: #475569; white-space: pre-wrap;">${safeMessage.slice(0, 300)}${safeMessage.length > 300 ? "..." : ""}</p>
            </div>
            <p style="font-size: 13px; color: #64748b; margin-top: 25px;">If you have any urgent inquiries, feel free to reply directly to this email or browse our academic programs at <a href="https://www.academicexcellences.com" style="color: #2563eb; font-weight: 600;">academicexcellences.com</a>.</p>
          `);
          await sendEmail(safeEmail, userSubject, userHtml);
        }

        success = true;
        break;
      }

      default:
        return res.status(400).json({ error: `Unknown email type: ${type}` });
    }

    return res.status(200).json({ success });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: err.message || "Failed to process email request" });
  }
};
