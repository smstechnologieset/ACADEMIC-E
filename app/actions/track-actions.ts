"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limiter";
import { sendCancellationEmail } from "@/lib/email";
import type { ApplicationEvent } from "@/types";

export interface TrackResult {
  found: boolean;
  id?: string;
  fullName?: string;
  courseApplied?: string;
  status?: string;
  submissionDate?: string;
  updatedAt?: string;
  paymentMethod?: string;
  events?: ApplicationEvent[];
}

export async function trackApplicationAction(refId: string): Promise<TrackResult> {
  // Rate limiting
  const hdrs = await headers();
  const ip = getClientIp(hdrs);
  const rl = rateLimit(`track:${ip}`, RATE_LIMITS.trackLookup);
  if (!rl.allowed) {
    return { found: false };
  }

  const cleanId = refId.trim().toUpperCase();
  if (!cleanId || cleanId.length < 5) {
    return { found: false };
  }

  try {
    const supabase = createAdminClient();

    const { data: app, error } = await supabase
      .from("applications")
      .select("id, full_name, course_applied, status, submission_date, updated_at, payment_method")
      .eq("id", cleanId)
      .single();

    if (error || !app) {
      return { found: false };
    }

    // Fetch timeline events
    const { data: events } = await supabase
      .from("application_events")
      .select("*")
      .eq("application_id", cleanId)
      .order("created_at", { ascending: true });

    return {
      found: true,
      id: app.id,
      fullName: app.full_name,
      courseApplied: app.course_applied,
      status: app.status,
      submissionDate: app.submission_date,
      updatedAt: app.updated_at,
      paymentMethod: app.payment_method,
      events: (events || []) as ApplicationEvent[],
    };
  } catch (err) {
    console.error("Track application error:", err);
    return { found: false };
  }
}

export async function cancelApplicationAction(
  refId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  const hdrs = await headers();
  const ip = getClientIp(hdrs);
  const rl = rateLimit(`cancel:${ip}`, RATE_LIMITS.trackLookup);
  if (!rl.allowed) {
    return { success: false, error: "Too many requests. Please try again later." };
  }

  const cleanId = refId.trim().toUpperCase();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanId || !cleanEmail) {
    return { success: false, error: "Reference ID and email are required." };
  }

  try {
    const supabase = createAdminClient();

    // Verify the application exists and email matches
    const { data: app, error } = await supabase
      .from("applications")
      .select("id, email, full_name, status, course_applied")
      .eq("id", cleanId)
      .single();

    if (error || !app) {
      return { success: false, error: "Application not found." };
    }

    if (app.email.toLowerCase() !== cleanEmail) {
      return { success: false, error: "Email does not match the application record." };
    }

    if (app.status === "approved" || app.status === "cancelled") {
      return { success: false, error: `Cannot cancel an application that is already ${app.status}.` };
    }

    // Update status to cancelled
    await supabase
      .from("applications")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", cleanId);

    // Insert timeline event
    await supabase.from("application_events").insert({
      application_id: cleanId,
      event_type: "cancelled",
      old_value: app.status,
      new_value: "cancelled",
      actor: "applicant",
    });

    // Send cancellation email
    await sendCancellationEmail(app.email, app.full_name, cleanId);

    return { success: true };
  } catch (err) {
    console.error("Cancel application error:", err);
    return { success: false, error: "Failed to cancel application." };
  }
}
