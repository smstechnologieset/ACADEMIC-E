// Follow this setup guide to integrate the Deno Edge Function with Supabase and Resend
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { application_id, status } = await req.json();

    if (!application_id || !status) {
      return new Response(JSON.stringify({ error: "Missing application_id or status" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { data: application, error: fetchError } = await supabase
      .from("applications")
      .select("*")
      .eq("id", application_id)
      .single();

    if (fetchError || !application) {
      return new Response(JSON.stringify({ error: "Application not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const isApproved = status === "approved";
    const subject = isApproved
      ? "Congratulations! Your Academic E Application Has Been Approved"
      : "Academic E Application Status Notice";

    const emailHtml = isApproved
      ? `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0b1220;">
          <h2>Academic E Admissions Committee</h2>
          <p>Dear ${application.full_name},</p>
          <p>We are pleased to inform you that your application (Ref: <strong>${application.id}</strong>) for <strong>${application.course_applied}</strong> has been <strong>APPROVED</strong>.</p>
          <p>Our admissions counselors will reach out to you directly with the complete enrollment package and visa sponsorship details.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;" />
          <p style="font-size: 12px; color: #64748b;">Academic E Education Consultancy Ltd.</p>
        </div>
      `
      : `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0b1220;">
          <h2>Academic E Admissions Committee</h2>
          <p>Dear ${application.full_name},</p>
          <p>Thank you for submitting your dossier (Ref: <strong>${application.id}</strong>) for review.</p>
          <p>We regret to inform you that the admissions board is unable to extend an offer for this cycle.</p>
          <p>You are welcome to re-apply during our next intake.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;" />
          <p style="font-size: 12px; color: #64748b;">Academic E Education Consultancy Ltd.</p>
        </div>
      `;

    if (RESEND_API_KEY) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Academic E <admissions@academice.org>",
          to: [application.email],
          subject,
          html: emailHtml,
        }),
      });

      const resData = await resendRes.json();
      return new Response(JSON.stringify({ success: true, resData }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, simulated: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
