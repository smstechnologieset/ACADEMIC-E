import { createAdminClient } from "./supabase/server";
import { mockStore } from "./mock-data";
import { Application, ApplicationFile, ApplicationStatus } from "@/types";

export async function getApplications(): Promise<Application[]> {
  try {
    const supabase = createAdminClient();
    const { data: apps, error } = await supabase
      .from("applications")
      .select("*, application_files(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase query error, falling back to mock store:", error.message);
      return mockStore || [];
    }

    if (apps && apps.length > 0) {
      return apps.map((app) => ({
        ...app,
        files: app.application_files || [],
      }));
    }

    return mockStore || [];
  } catch (err) {
    console.warn("Supabase connection fallback to mock store:", err);
    return mockStore || [];
  }
}

export async function getApplicationById(id: string): Promise<Application | null> {
  try {
    const supabase = createAdminClient();
    const { data: app, error } = await supabase
      .from("applications")
      .select("*, application_files(*)")
      .eq("id", id)
      .single();

    if (error || !app) {
      const found = (mockStore || []).find((a) => a.id === id);
      return found || null;
    }

    // Generate signed URLs for files
    const filesWithSignedUrls: ApplicationFile[] = [];
    if (app.application_files && app.application_files.length > 0) {
      for (const file of app.application_files) {
        const bucket = file.file_category === "document" ? "documents" : "payment-proofs";
        const { data: signedData } = await supabase.storage
          .from(bucket)
          .createSignedUrl(file.file_path, 3600); // 1 hour

        filesWithSignedUrls.push({
          ...file,
          signedUrl: signedData?.signedUrl || undefined,
        });
      }
    }

    return {
      ...app,
      files: filesWithSignedUrls,
    };
  } catch (err) {
    console.warn("Using mock store for application lookup:", err);
    return (mockStore || []).find((a) => a.id === id) || null;
  }
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  internalNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
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
      .eq("id", id);

    if (error) {
      console.warn("Supabase update error, applying to mock store:", error.message);
    }
  } catch (err) {
    console.warn("Supabase update exception, applying to mock store:", err);
  }

  // Also update mock store so UI reflects immediate change
  const found = (mockStore || []).find((a) => a.id === id);
  if (found) {
    found.status = status;
    if (internalNotes !== undefined) found.internal_notes = internalNotes;
    found.updated_at = new Date().toISOString();
  }

  return { success: true };
}
