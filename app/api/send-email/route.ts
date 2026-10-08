import { NextRequest, NextResponse } from "next/server";
import {
  sendApplicationReceivedEmail,
  sendPaymentReceivedEmail,
  sendStatusApprovedEmail,
  sendStatusRejectedEmail,
  sendCancellationEmail,
  sendContactInquiryEmail,
  sendPasswordResetOtpEmail,
  sendPasswordResetSuccessEmail,
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

    if (action === "get_staff_users") {
      const res = await fetch(`${supabaseUrl}/rest/v1/site_settings?key=eq.staff_users&select=key,value`, {
        headers: { apikey: srvKey, Authorization: `Bearer ${srvKey}` },
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].value) {
        try {
          const parsed = typeof data[0].value === "string" ? JSON.parse(data[0].value) : data[0].value;
          return NextResponse.json(Array.isArray(parsed) ? parsed : []);
        } catch (_) {
          return NextResponse.json([]);
        }
      }
      return NextResponse.json([]);
    }

    return NextResponse.json({ message: "Academic Excellence Email API Active" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, to, name, refId, course, reason, rejectionReason, email, phone, subject, message, code, newPassword } = body;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tfmbmmtlppkzcxpndiym.supabase.co";
    const srvKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (type === "save_staff_users") {
      const staffUsersPayload = body.staff_users || [];
      const payloadStr = typeof staffUsersPayload === "string" ? staffUsersPayload : JSON.stringify(staffUsersPayload);
      if (srvKey) {
        const res = await fetch(`${supabaseUrl}/rest/v1/site_settings`, {
          method: "POST",
          headers: {
            apikey: srvKey,
            Authorization: `Bearer ${srvKey}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates,return=representation",
          },
          body: JSON.stringify({
            key: "staff_users",
            value: payloadStr,
            updated_at: new Date().toISOString(),
          }),
        });
        if (!res.ok) {
          const errTxt = await res.text();
          return NextResponse.json({ error: "Failed to persist staff users: " + errTxt }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: "Server service key missing" }, { status: 500 });
    }

    // ── PASSWORD RESET FLOW ──
    if (type === "request_password_reset") {
      const targetEmail = (email || to || "").trim().toLowerCase();
      if (!targetEmail || !targetEmail.includes("@")) {
        return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
      }
      if (!srvKey) {
        return NextResponse.json({ error: "Server configuration key missing" }, { status: 500 });
      }

      let foundType = "";
      let foundId = "";
      let foundName = "";

      // 1. Check Supabase Auth Users
      try {
        const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
          headers: { apikey: srvKey, Authorization: `Bearer ${srvKey}` },
        });
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData && Array.isArray(authData.users)) {
            const adminUser = authData.users.find((u: any) => u.email && u.email.toLowerCase() === targetEmail);
            if (adminUser) {
              foundType = "admin";
              foundId = adminUser.id;
              foundName = "Super Administrator";
            }
          }
        }
      } catch (authErr) {
        console.warn("Auth user lookup error:", authErr);
      }

      // 2. If not found in Auth, check Staff Users
      if (!foundType) {
        try {
          const staffRes = await fetch(`${supabaseUrl}/rest/v1/site_settings?key=eq.staff_users&select=value`, {
            headers: { apikey: srvKey, Authorization: `Bearer ${srvKey}` },
          });
          if (staffRes.ok) {
            const staffRows = await staffRes.json();
            if (Array.isArray(staffRows) && staffRows.length > 0 && staffRows[0].value) {
              const staffList = typeof staffRows[0].value === "string" ? JSON.parse(staffRows[0].value) : staffRows[0].value;
              if (Array.isArray(staffList)) {
                const staff = staffList.find((s: any) => s.email && s.email.toLowerCase() === targetEmail);
                if (staff) {
                  foundType = "staff";
                  foundId = staff.id;
                  foundName = staff.name || "Staff Member";
                }
              }
            }
          }
        } catch (staffErr) {
          console.warn("Staff user lookup error:", staffErr);
        }
      }

      if (!foundType) {
        return NextResponse.json(
          { error: "No administrator or staff account was found matching this email address." },
          { status: 404 }
        );
      }

      // Generate 6-Digit OTP Code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const resetKey = "pwd_reset_" + targetEmail.replace(/[^a-z0-9]/g, "_");

      // Save OTP into site_settings with 15-minute expiration
      await fetch(`${supabaseUrl}/rest/v1/site_settings`, {
        method: "POST",
        headers: {
          apikey: srvKey,
          Authorization: `Bearer ${srvKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          key: resetKey,
          value: JSON.stringify({
            code: otpCode,
            email: targetEmail,
            type: foundType,
            id: foundId,
            name: foundName,
            expiresAt: Date.now() + 15 * 60 * 1000,
          }),
          updated_at: new Date().toISOString(),
        }),
      });

      // Send OTP Email
      await sendPasswordResetOtpEmail(targetEmail, foundName, otpCode);

      return NextResponse.json({
        success: true,
        message: `A 6-digit verification code has been dispatched to ${targetEmail}.`,
      });
    }

    if (type === "verify_and_reset_password") {
      const targetEmail = (email || to || "").trim().toLowerCase();
      const otpCode = (code || "").trim();
      const newPass = (newPassword || "").trim();

      if (!targetEmail || !otpCode || !newPass) {
        return NextResponse.json({ error: "Email, verification code, and new password are required." }, { status: 400 });
      }
      if (newPass.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
      }
      if (!srvKey) {
        return NextResponse.json({ error: "Server configuration key missing" }, { status: 500 });
      }

      const resetKey = "pwd_reset_" + targetEmail.replace(/[^a-z0-9]/g, "_");
      const recordRes = await fetch(`${supabaseUrl}/rest/v1/site_settings?key=eq.${resetKey}&select=value`, {
        headers: { apikey: srvKey, Authorization: `Bearer ${srvKey}` },
      });
      const recordData = await recordRes.json();
      if (!Array.isArray(recordData) || recordData.length === 0 || !recordData[0].value) {
        return NextResponse.json({ error: "No pending password reset found. Please request a new code." }, { status: 400 });
      }

      let record: any;
      try {
        record = typeof recordData[0].value === "string" ? JSON.parse(recordData[0].value) : recordData[0].value;
      } catch (_) {
        return NextResponse.json({ error: "Invalid reset session. Please request a new code." }, { status: 400 });
      }

      if (record.code !== otpCode) {
        return NextResponse.json({ error: "Incorrect verification code. Please check your email and try again." }, { status: 400 });
      }
      if (Date.now() > record.expiresAt) {
        return NextResponse.json({ error: "This verification code has expired. Please request a new code." }, { status: 400 });
      }

      // Code matches and is valid! Update password
      if (record.type === "admin") {
        const updateAuthRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${record.id}`, {
          method: "PUT",
          headers: {
            apikey: srvKey,
            Authorization: `Bearer ${srvKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: newPass }),
        });
        if (!updateAuthRes.ok) {
          const errTxt = await updateAuthRes.text();
          return NextResponse.json({ error: "Failed to update admin password: " + errTxt }, { status: 500 });
        }
      } else if (record.type === "staff") {
        const staffRes = await fetch(`${supabaseUrl}/rest/v1/site_settings?key=eq.staff_users&select=value`, {
          headers: { apikey: srvKey, Authorization: `Bearer ${srvKey}` },
        });
        const staffRows = await staffRes.json();
        let staffList = (staffRows && staffRows[0] && staffRows[0].value) ? JSON.parse(staffRows[0].value) : [];
        staffList = staffList.map((s: any) => {
          if (s.email && s.email.toLowerCase() === targetEmail) {
            return { ...s, password: newPass, updatedAt: new Date().toISOString() };
          }
          return s;
        });
        await fetch(`${supabaseUrl}/rest/v1/site_settings`, {
          method: "POST",
          headers: {
            apikey: srvKey,
            Authorization: `Bearer ${srvKey}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            key: "staff_users",
            value: JSON.stringify(staffList),
            updated_at: new Date().toISOString(),
          }),
        });
      }

      // Delete the used OTP code
      await fetch(`${supabaseUrl}/rest/v1/site_settings?key=eq.${resetKey}`, {
        method: "DELETE",
        headers: { apikey: srvKey, Authorization: `Bearer ${srvKey}` },
      });

      // Send confirmation receipt email
      await sendPasswordResetSuccessEmail(targetEmail, record.name || "Administrator");

      return NextResponse.json({
        success: true,
        message: "Your password has been successfully reset! You can now sign in with your new password.",
      });
    }

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
