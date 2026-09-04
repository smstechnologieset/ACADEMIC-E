"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { ApplicationStatus } from "@/types";
import { logAdminAction } from "@/lib/activity-logger";
import {
  sendStatusApprovedEmail,
  sendStatusRejectedEmail,
} from "@/lib/email";

export async function processApplicationDecisionAction(
  applicationId: string,
  status: ApplicationStatus,
  internalNotes: string,
  applicantEmail: string,
  applicantName: string,
  actorEmail: string = "admin"
) {
  try {
    const supabase = createAdminClient();

    // 1. Get old status for timeline
    const { data: currentApp } = await supabase
      .from("applications")
      .select("status, course_applied")
      .eq("id", applicationId)
      .single();

    const oldStatus = currentApp?.status || "unknown";
    const course = currentApp?.course_applied || "";

    // 2. Update database record
    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (internalNotes !== undefined) {
      updatePayload.internal_notes = internalNotes;
    }

    const { error } = await supabase
      .from("applications")
      .update(updatePayload)
      .eq("id", applicationId);

    if (error) {
      return { success: false, error: error.message };
    }

    // 3. Insert timeline event
    await supabase.from("application_events").insert({
      application_id: applicationId,
      event_type: "status_changed",
      old_value: oldStatus,
      new_value: status,
      actor: actorEmail,
    });

    // 4. Log admin activity
    await logAdminAction(
      actorEmail,
      status === "approved" ? "approved_application" : status === "rejected" ? "rejected_application" : `set_status_${status}`,
      "application",
      applicationId,
      { applicantName, oldStatus, newStatus: status }
    );

    // 5. Send notification email
    if (status === "approved") {
      await sendStatusApprovedEmail(applicantEmail, applicantName, applicationId, course);
    } else if (status === "rejected") {
      await sendStatusRejectedEmail(applicantEmail, applicantName, applicationId);
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process decision";
    return { success: false, error: msg };
  }
}
