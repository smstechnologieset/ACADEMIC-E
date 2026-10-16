/**
 * Academic Excellence — Serverless Email Notification Handler
 * Compatible with Vercel Serverless Functions (Node.js)
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "Academic Excellence <admin@academicexcellences.com>";
const REPLY_TO_ADDRESS = process.env.RESEND_REPLY_TO || "academicexcellenceco@gmail.com";

const baseWrapper = (content) => `
<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
  <div style="background: linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%); padding: 32px 30px; text-align: left;">
    <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
      🎓 Academic Excellence
    </div>
    <div style="color: #93c5fd; font-size: 13px; margin-top: 6px; font-weight: 500;">
      Admissions Office
    </div>
  </div>
  <div style="padding: 32px 30px; color: #1e293b; font-size: 15px; line-height: 1.7;">
    ${content}
  </div>
  <div style="padding: 24px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
    <p style="font-size: 12px; color: #64748b; margin: 0 0 6px 0;">
      Academic Excellence • Powered by <a href="https://smstechnologieset.com/" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 600;">SMS Technologies</a>
    </p>
    <p style="font-size: 11px; color: #94a3b8; margin: 0;">
      Addis Ababa, Ethiopia • official inquiries: admin@academicexcellences.com
    </p>
  </div>
</div>
`;

async function sendEmail(to, subject, htmlBody, customReplyTo = null) {
  const apiKey = RESEND_API_KEY || process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[EMAIL SIMULATED] To: ${to} | Subject: ${subject}`);
    return true;
  }

  const toArray = Array.isArray(to) ? to : [to];
  const replyToArray = customReplyTo ? [customReplyTo] : [REPLY_TO_ADDRESS];

  try {
    // 1. Primary send with configured domain
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: toArray,
        reply_to: replyToArray,
        subject,
        html: htmlBody
      })
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`[EMAIL SENT] ID: ${data.id} To: ${JSON.stringify(to)}`);
      return true;
    }

    const errText = await res.text();
    console.warn(`[EMAIL ERROR] Resend returned ${res.status}: ${errText}`);

    // 2. Fallback: If domain unverified, try onboarding@resend.dev
    if (res.status === 403 && errText.includes("domain is not verified")) {
      console.warn("[EMAIL FALLBACK] Attempting delivery via onboarding@resend.dev...");
      const fallbackRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Academic Excellence <onboarding@resend.dev>",
          to: toArray,
          reply_to: replyToArray,
          subject,
          html: htmlBody
        })
      });

      if (fallbackRes.ok) {
        return true;
      }

      const fbBody = await fallbackRes.text();
      // 3. Fallback: If sandbox restricted external recipient, send copy to admin (solhm1@yahoo.com)
      if (fbBody.includes("only send testing emails to your own email address") || fbBody.includes("validation_error")) {
        console.warn("[EMAIL FALLBACK] Forwarding admin copy to solhm1@yahoo.com...");
        const adminRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "Academic Excellence <onboarding@resend.dev>",
            to: ["solhm1@yahoo.com"],
            reply_to: replyToArray,
            subject: `[Applicant Copy: ${toArray.join(", ")}] ${subject}`,
            html: `
              <div style="background:#fee2e2;border:1px solid #ef4444;padding:12px 16px;border-radius:8px;margin-bottom:16px;color:#991b1b;font-size:13px;">
                <strong>⚠️ DNS Records Pending on academicexcellences.com:</strong><br/>
                This notification was intended for: <strong>${toArray.join(", ")}</strong>.<br/>
                Add the Resend DKIM and SPF records in your domain DNS to enable direct recipient delivery.
              </div>
              ${htmlBody}
            `
          })
        });

        if (adminRes.ok) {
          return true;
        }
      }
    }

    return false;
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

    if (actionParam === "get_page_content") {
      try {
        const r = await fetch(`${supabaseUrl}/rest/v1/site_settings?key=eq.page_content&select=key,value,updated_at`, {
          headers: { "apikey": srvKey, "Authorization": `Bearer ${srvKey}` }
        });
        const rows = await r.json();
        if (Array.isArray(rows) && rows.length > 0 && rows[0].value) {
          const parsed = typeof rows[0].value === "string" ? JSON.parse(rows[0].value) : rows[0].value;
          return res.status(200).json(parsed);
        }
        return res.status(200).json(null);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    if (actionParam === "get_faqs") {
      try {
        const r = await fetch(`${supabaseUrl}/rest/v1/cms_faqs?order=sort_order.asc`, {
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

    if (type === "save_page_content") {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tfmbmmtlppkzcxpndiym.supabase.co";
      const srvKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!srvKey) {
        return res.status(500).json({ error: "Server service key missing" });
      }
      const contentPayload = body.content || body.page_content || {};
      const payloadStr = typeof contentPayload === "string" ? contentPayload : JSON.stringify(contentPayload);
      const r = await fetch(`${supabaseUrl}/rest/v1/site_settings`, {
        method: "POST",
        headers: {
          "apikey": srvKey,
          "Authorization": `Bearer ${srvKey}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates,return=representation"
        },
        body: JSON.stringify({
          key: "page_content",
          value: payloadStr,
          updated_at: new Date().toISOString()
        })
      });
      if (!r.ok) {
        const errTxt = await r.text();
        return res.status(500).json({ error: "Failed to persist page content: " + errTxt });
      }
      return res.status(200).json({ success: true });
    }

    if (!to && type !== "contact_inquiry" && type !== "save_page_content" && type !== "save_staff_users") {
      return res.status(400).json({ error: "Recipient email 'to' is required." });
    }

    const safeName = (name || "Applicant").trim();
    const safeRef = (refId || "").trim();
    const safeCourse = (course || "Selected Academic Program").trim();

    let success = false;

    switch (type) {
      case "application_received": {
        const subject = `Application Received — Reference ${safeRef} (Under Document Review)`;
        const html = baseWrapper(`
          <p>Dear <strong>${safeName}</strong>,</p>
          <p>Thank you for applying to Academic Excellence. Your application and uploaded credentials (FAYDA ID and Academic Transcripts) have been securely received and registered in our admissions system.</p>
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 18px 22px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <p style="margin: 0; font-size: 13px; color: #1e3a8a;"><strong>YOUR APPLICATION REFERENCE ID:</strong></p>
            <p style="margin: 6px 0 0 0; font-size: 22px; font-weight: 800; font-family: monospace; color: #1d4ed8; letter-spacing: 1px;">${safeRef}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #334155;"><strong>Program Track:</strong> ${safeCourse}</p>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #0369a1;"><strong>Current Stage:</strong> Stage 1 — Academic Document Verification</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: #0f172a; font-weight: 600;">ℹ️ Important: No Payment is Required at This Stage</p>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569; line-height: 1.6;">Our admissions committee verifies educational transcripts and national identity before accepting any fees. If your qualifications meet our curriculum standards, you will receive an official approval email with a payment invitation to finalize your enrollment.</p>
          </div>
          <p style="font-size: 14px;">You can check your real-time application status anytime at: <br />
            <a href="https://www.academicexcellences.com/track.html?ref=${encodeURIComponent(safeRef)}" style="display: inline-block; margin-top: 8px; background: #0b1b3d; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px;">Track Your Application Status →</a>
          </p>
          <p style="font-size: 13px; color: #64748b; margin-top: 25px;">If you have any questions, reply directly to this email or contact admissions desk.</p>
        `);
        success = await sendEmail(to, subject, html);
        break;
      }

      case "approved_for_payment": {
        const subject = `🎉 Congratulations! Your Application is Approved — Complete Your Enrollment (${safeRef})`;
        const html = baseWrapper(`
          <p>Dear <strong>${safeName}</strong>,</p>
          <p>Congratulations! We are delighted to inform you that your academic documents and FAYDA ID have been reviewed and <strong>Approved for Admission</strong> into <strong>${safeCourse}</strong>.</p>
          
          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 18px 22px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; font-weight: 700; color: #065f46;">ACADEMIC QUALIFICATIONS APPROVED</p>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #334155;"><strong>Reference:</strong> ${safeRef} • <strong>Program:</strong> ${safeCourse}</p>
          </div>

          <div style="background: #fefce8; border: 1px solid #fef08a; border-left: 4px solid #eab308; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; font-weight: 700; color: #854d0e;">⏱️ 72-Hour Seat Reservation Notice</p>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #713f12; line-height: 1.6;">
              Your seat in this upcoming intake is temporarily reserved for <strong>72 hours</strong>. To secure your enrollment and unlock your Skillsoft Percipio student access, please finalize your subsidized tuition fee payment within this window.
            </p>
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <a href="https://www.academicexcellences.com/payment-instructions.html?ref=${encodeURIComponent(safeRef)}" style="background: #16a34a; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
              Complete Your Payment &amp; Confirm Seat →
            </a>
          </p>

          <p style="font-size: 13px; color: #475569;">
            We accept local payment via <strong>Telebirr</strong>, <strong>Commercial Bank of Ethiopia (CBE)</strong>, <strong>Awash Bank</strong>, and <strong>Bank of Abyssinia</strong>. After transferring, simply upload your transaction slip screenshot on the payment page.
          </p>
          <p style="font-size: 13px; color: #64748b; margin-top: 25px;">Welcome to the Academic Excellence community!</p>
        `);
        success = await sendEmail(to, subject, html);
        break;
      }

      case "payment_received": {
        const subject = `Payment Slip Received — Final Verification in Progress (${safeRef})`;
        const html = baseWrapper(`
          <p>Dear <strong>${safeName}</strong>,</p>
          <p>We have successfully received your payment proof submission for Application <strong>${safeRef}</strong>. Your payment receipt is now undergoing final audit with our finance records.</p>
          <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 18px 22px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <p style="margin: 0; font-size: 13px; color: #854d0e;"><strong>Application Reference:</strong> ${safeRef}</p>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #854d0e;"><strong>Stage:</strong> Final Payment Verification in progress</p>
          </div>
          <p style="font-size: 14px;">Once your bank or Telebirr transaction confirmation is verified, your status will update to <strong>Accepted and Paid in Full</strong>, and your student onboarding package will be sent.</p>
          <p style="font-size: 14px;">You can monitor your live status at: <a href="https://www.academicexcellences.com/track.html?ref=${encodeURIComponent(safeRef)}" style="color: #2563eb; font-weight: 600;">Track Application</a>.</p>
        `);
        success = await sendEmail(to, subject, html);
        break;
      }

      case "accepted_paid":
      case "status_approved": {
        const subject = `🎓 Welcome to Academic Excellence! Enrollment Confirmed & Paid in Full (${safeRef})`;
        const html = baseWrapper(`
          <p>Dear <strong>${safeName}</strong>,</p>
          <p>Congratulations! Your payment has been verified successfully, and your admission is officially <strong>Accepted and Paid in Full</strong>.</p>
          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 18px 22px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; font-weight: 700; color: #065f46;">ADMISSION &amp; PAYMENT CONFIRMED</p>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #334155;"><strong>Reference:</strong> ${safeRef} • <strong>Program:</strong> ${safeCourse}</p>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #047857;"><strong>Status:</strong> Enrolled Candidate</p>
          </div>
          <p style="font-size: 14px;">Our student success team will contact you shortly with your official credentials for the Skillsoft Percipio learning platform, curriculum syllabus, and orientation timetable.</p>
          <p style="font-size: 13px; color: #64748b; margin-top: 25px;">Welcome to Academic Excellence! We look forward to supporting your educational journey.</p>
        `);
        success = await sendEmail(to, subject, html);
        break;
      }

      case "payment_unsuccessful": {
        const rawReason = (reason || rejectionReason || "The submitted transaction reference could not be matched with bank deposit records.").trim();
        const safeReason = rawReason.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
        const subject = `Action Required: Payment Verification Unsuccessful (${safeRef})`;
        const html = baseWrapper(`
          <p>Dear <strong>${safeName}</strong>,</p>
          <p>Thank you for submitting your payment receipt for application <strong>${safeRef}</strong> (${safeCourse}).</p>
          <p>Our finance department reviewed your deposit slip but was <strong>unable to verify your payment</strong> at this time.</p>
          
          <div style="background: #fff7ed; border: 1px solid #fed7aa; border-left: 4px solid #ea580c; padding: 18px 22px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #c2410c; text-transform: uppercase;">Finance Department Feedback:</p>
            <p style="margin: 0; font-size: 14px; color: #9a3412; font-weight: 500; white-space: pre-wrap;">${safeReason}</p>
          </div>

          <p style="font-size: 14px; font-weight: 600;">What you should do next:</p>
          <p style="font-size: 13px; color: #334155; line-height: 1.6;">
            Please double-check your bank SMS or Telebirr transaction ID, make sure your slip photo clearly shows the transaction reference number and date, and re-upload your valid receipt:
          </p>

          <p style="text-align: center; margin: 26px 0;">
            <a href="https://www.academicexcellences.com/payment-instructions.html?ref=${encodeURIComponent(safeRef)}" style="background: #ea580c; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">
              Re-upload Valid Payment Proof →
            </a>
          </p>

          <p style="font-size: 13px; color: #64748b;">If you need assistance, simply reply to this email with your transaction screenshot.</p>
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
        await sendEmail(["admin@academicexcellences.com", "academicexcellenceco@gmail.com"], adminSubject, adminHtml, safeEmail);

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
