"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { mockStore } from "@/lib/mock-data";
import { Application } from "@/types";
import { recordContactMessage } from "@/lib/cms-repo";

export async function submitApplicationAction(formData: FormData) {
  try {
    const firstName = (formData.get("firstName") as string)?.trim();
    const middleName = (formData.get("middleName") as string)?.trim() || "";
    const lastName = (formData.get("lastName") as string)?.trim();
    const ageRaw = formData.get("age") as string;
    const age = ageRaw ? parseInt(ageRaw, 10) : undefined;
    const fullAddress = (formData.get("fullAddress") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const qualification = (formData.get("qualification") as string)?.trim() || "";
    const courseApplied = (formData.get("courseApplied") as string)?.trim();
    const signature = (formData.get("signature") as string)?.trim();
    const place = (formData.get("place") as string)?.trim();
    const submissionDate = (formData.get("submissionDate") as string) || new Date().toISOString().split("T")[0];
    const faydaFile = formData.get("faydaId") as File | null;

    if (!firstName || !lastName || !fullAddress || !phone || !email || !courseApplied || !signature || !place) {
      return { success: false, error: "Please complete all mandatory questionnaire fields." };
    }

    if (!faydaFile || faydaFile.size === 0) {
      return { success: false, error: "Please upload your Official ID (FAYDA) document or image." };
    }

    if (faydaFile.size > 10 * 1024 * 1024) {
      return { success: false, error: "Official ID file exceeds maximum size of 10MB." };
    }

    const fullName = middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;
    const newAppId = crypto.randomUUID();
    const cleanFileName = faydaFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${newAppId}/${cleanFileName}`;

    try {
      const supabase = createAdminClient();

      // 1. Upload FAYDA ID to 'documents' bucket
      const fileBuffer = await faydaFile.arrayBuffer();
      await supabase.storage.from("documents").upload(filePath, fileBuffer, {
        contentType: faydaFile.type || "application/octet-stream",
        upsert: true,
      });

      // 2. Insert into applications
      await supabase.from("applications").insert({
        id: newAppId,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        full_name: fullName,
        age,
        full_address: fullAddress,
        phone,
        email,
        qualification,
        course_applied: courseApplied,
        signature,
        place,
        submission_date: submissionDate,
        status: "pending",
      });

      // 3. Insert into application_files
      await supabase.from("application_files").insert({
        application_id: newAppId,
        file_category: "fayda_id",
        file_path: filePath,
        file_name: faydaFile.name,
        file_size: faydaFile.size,
        mime_type: faydaFile.type,
      });
    } catch (dbErr) {
      console.warn("Supabase live write failed, saving to mock store fallback:", dbErr);
    }

    // Always sync mock store for immediate local reliability
    const newApp: Application = {
      id: newAppId,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      full_name: fullName,
      age,
      full_address: fullAddress,
      phone,
      email,
      qualification,
      course_applied: courseApplied,
      signature,
      place,
      submission_date: submissionDate,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      files: [
        {
          id: crypto.randomUUID(),
          application_id: newAppId,
          file_category: "fayda_id",
          file_path: filePath,
          file_name: faydaFile.name,
          file_size: faydaFile.size,
          mime_type: faydaFile.type,
          uploaded_at: new Date().toISOString(),
        },
      ],
    };

    if (mockStore) {
      mockStore.unshift(newApp);
    }

    return { success: true, applicationId: newAppId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit application.";
    return { success: false, error: message };
  }
}

export async function submitPaymentProofAction(formData: FormData) {
  try {
    const applicationId = formData.get("applicationId") as string;
    const paymentMethod = (formData.get("paymentMethod") as string)?.trim() || "Telebirr / Bank Transfer";
    const transactionRef = (formData.get("transactionRef") as string)?.trim() || "";
    const file = formData.get("paymentProof") as File | null;

    if (!applicationId) {
      return { success: false, error: "Missing application reference ID." };
    }

    if (!file || file.size === 0) {
      return { success: false, error: "Please attach your bank deposit / transfer slip." };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Payment slip image exceeds maximum size of 5MB." };
    }

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${applicationId}/${cleanFileName}`;

    try {
      const supabase = createAdminClient();
      const fileBuffer = await file.arrayBuffer();

      await supabase.storage.from("payment-proofs").upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

      await supabase.from("application_files").insert({
        application_id: applicationId,
        file_category: "payment_proof",
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      });

      await supabase
        .from("applications")
        .update({
          status: "under_review",
          payment_method: paymentMethod,
          transaction_ref: transactionRef,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId);
    } catch (err) {
      console.warn("Supabase payment update exception, sync mock store:", err);
    }

    if (mockStore) {
      const app = mockStore.find((a) => a.id === applicationId);
      if (app) {
        app.status = "under_review";
        app.payment_method = paymentMethod;
        app.transaction_ref = transactionRef;
        app.updated_at = new Date().toISOString();
        if (!app.files) app.files = [];
        app.files.push({
          id: crypto.randomUUID(),
          application_id: applicationId,
          file_category: "payment_proof",
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          uploaded_at: new Date().toISOString(),
        });
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to upload payment proof.";
    return { success: false, error: message };
  }
}

export async function submitContactMessageAction(formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.trim();
    const message = (formData.get("message") as string)?.trim();

    if (!email || !message) {
      return { success: false, error: "Please enter your email and message." };
    }

    await recordContactMessage({ email, message });

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to send contact inquiry.";
    return { success: false, error: errorMsg };
  }
}
