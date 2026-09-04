"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { ApplicationStatus } from "@/types";
import { logAdminAction } from "@/lib/activity-logger";
import { sendStatusApprovedEmail, sendStatusRejectedEmail } from "@/lib/email";

export async function bulkUpdateApplicationStatus(
  ids: string[],
  status: ApplicationStatus,
  actorEmail: string = "admin"
): Promise<{ success: boolean; processed: number; errors: string[] }> {
  const errors: string[] = [];
  let processed = 0;

  const supabase = createAdminClient();

  for (const id of ids) {
    try {
      // Get current app data for email and timeline
      const { data: app } = await supabase
        .from("applications")
        .select("status, email, full_name, course_applied")
        .eq("id", id)
        .single();

      if (!app) {
        errors.push(`${id}: Application not found`);
        continue;
      }

      const oldStatus = app.status;

      // Update status
      const { error } = await supabase
        .from("applications")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        errors.push(`${id}: ${error.message}`);
        continue;
      }

      // Insert timeline event
      await supabase.from("application_events").insert({
        application_id: id,
        event_type: "status_changed",
        old_value: oldStatus,
        new_value: status,
        actor: actorEmail,
      });

      // Send email
      if (status === "approved") {
        await sendStatusApprovedEmail(app.email, app.full_name, id, app.course_applied);
      } else if (status === "rejected") {
        await sendStatusRejectedEmail(app.email, app.full_name, id);
      }

      processed++;
    } catch (err) {
      errors.push(`${id}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  // Log bulk action
  await logAdminAction(
    actorEmail,
    `bulk_${status}`,
    "application",
    undefined,
    { ids, processed, total: ids.length, errors: errors.length }
  );

  revalidatePath("/admin/dashboard");
  revalidatePath("/");

  return { success: errors.length === 0, processed, errors };
}
