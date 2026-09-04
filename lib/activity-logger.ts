/**
 * Admin Activity Logger — Audit Trail
 * Logs every admin action to the admin_activity_log table
 */

import { createAdminClient } from "@/lib/supabase/server";

export async function logAdminAction(
  actorEmail: string,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("admin_activity_log").insert({
      actor_email: actorEmail,
      action,
      target_type: targetType,
      target_id: targetId,
      details: details || null,
    });
  } catch (err) {
    // Activity logging should never break the main operation
    console.warn("[Activity Log] Failed to log action:", err);
  }
}
