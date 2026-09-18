/**
 * Academic Excellence — Serverless Email Notification Handler
 * Compatible with Vercel Serverless Functions (Node.js)
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "Academic Excellence <admin@academicexcellences.com>";
const REPLY_TO_ADDRESS = process.env.RESEND_REPLY_TO || "solhm1@yahoo.com";

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

async function sendEmail(to, subject, htmlBody) {
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
        reply_to: [REPLY_TO_ADDRESS],
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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { type, to, name, refId, course } = body;

    if (!to) {
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
            <p style="margin: 0; font-size: 13px; color: #854d0e;">⏳ <strong>ADMISSIONS STATUS:</strong></p>
            <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 700; color: #a16207;">Under Review</p>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #475569;">Our admissions officers are verifying your payment and academic transcripts. Evaluation typically concludes within 24 to 48 business hours.</p>
          </div>
          <p style="font-size: 14px;">You can monitor the real-time status of your verification at <a href="https://academicexcellences.com/track.html" style="color: #2563eb; font-weight: 600;">academicexcellences.com/track.html</a> using Reference ID: <strong>${safeRef}</strong>.</p>
          <p style="font-size: 13px; color: #64748b; margin-top: 25px;">Thank you for your commitment to academic excellence.</p>
        `);
        success = await sendEmail(to, subject, html);
        break;
      }

      case "status_approved": {
        const subject = `🎉 Congratulations! Application ${safeRef} Approved`;
        const html = baseWrapper(`
          <p>Dear <strong>${safeName}</strong>,</p>
          <p>We are delighted to inform you that following comprehensive evaluation by the Admissions Committee, your application has been officially <strong style="color: #16a34a;">APPROVED</strong>.</p>
          <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 18px 22px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <p style="margin: 0; font-size: 13px; color: #166534;">✅ <strong>ADMISSION DECISION:</strong></p>
            <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 700; color: #15803d;">Officially Admitted / Enrolled</p>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #334155;"><strong>Reference:</strong> ${safeRef} • <strong>Program:</strong> ${safeCourse}</p>
          </div>
          <p style="font-size: 14px;">Our student success team will contact you shortly with your official credentials for the Skillsoft Percipio learning platform, curriculum syllabus, and orientation timetable.</p>
          <p style="font-size: 13px; color: #64748b; margin-top: 25px;">Welcome to Academic Excellence! We look forward to supporting your educational journey.</p>
        `);
        success = await sendEmail(to, subject, html);
        break;
      }

      case "status_rejected": {
        const subject = `Application Status Update — ${safeRef}`;
        const html = baseWrapper(`
          <p>Dear <strong>${safeName}</strong>,</p>
          <p>Thank you for submitting your application (Ref: <strong>${safeRef}</strong>) for our academic programs.</p>
          <p>After thorough review by the Admissions Committee, we regret to inform you that we are unable to offer you placement for this specific intake cycle.</p>
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 18px 22px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <p style="margin: 0; font-size: 13px; color: #991b1b;">We encourage you to bolster your credentials and consider reapplying during our subsequent intake period.</p>
          </div>
          <p style="font-size: 13px; color: #64748b; margin-top: 25px;">If you have questions or require further clarification, please contact our admissions office.</p>
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

      default:
        return res.status(400).json({ error: `Unknown email type: ${type}` });
    }

    return res.status(200).json({ success });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: err.message || "Failed to process email request" });
  }
};
