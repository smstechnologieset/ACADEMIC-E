"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { generateShortId } from "@/lib/id-generator";
import { validateFileType, validateFileSize, sanitizeFileName, checkDangerousExtension } from "@/lib/file-validation";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limiter";
import { recordContactMessage } from "@/lib/cms-repo";
import { sendApplicationReceivedEmail, sendPaymentReceivedEmail } from "@/lib/email";

export async function submitApplicationAction(formData: FormData) {
  try {
    // Rate limiting
    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    const rl = rateLimit(`app-submit:${ip}`, RATE_LIMITS.applicationSubmit);
    if (!rl.allowed) {
      return { success: false, error: "Too many applications submitted. Please try again later." };
    }

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

    // Server-side file validation
    const sizeCheck = validateFileSize(faydaFile.size, 10);
    if (!sizeCheck.valid) return { success: false, error: sizeCheck.error };

    const extCheck = checkDangerousExtension(faydaFile.name);
    if (!extCheck.safe) return { success: false, error: extCheck.error };

    const fileBuffer = await faydaFile.arrayBuffer();
    const typeCheck = validateFileType(fileBuffer, faydaFile.type);
    if (!typeCheck.valid) return { success: false, error: typeCheck.error };

    const fullName = middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;
    const cleanFileName = sanitizeFileName(faydaFile.name);

    // Generate short ID with collision check
    const supabase = createAdminClient();
    let newAppId = generateShortId();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from("applications")
        .select("id")
        .eq("id", newAppId)
        .maybeSingle();
      if (!existing) break;
      newAppId = generateShortId();
      attempts++;
    }

    const filePath = `${newAppId}/${cleanFileName}`;

    // 1. Upload FAYDA ID to 'documents' bucket
    await supabase.storage.from("documents").upload(filePath, fileBuffer, {
      contentType: typeCheck.detectedMime || faydaFile.type || "application/octet-stream",
      upsert: true,
    });

    // 2. Insert into applications
    const { error: insertErr } = await supabase.from("applications").insert({
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

    if (insertErr) {
      console.error("Application insert error:", insertErr.message);
      return { success: false, error: "Failed to save application. Please try again." };
    }

    // 3. Insert into application_files
    await supabase.from("application_files").insert({
      application_id: newAppId,
      file_category: "fayda_id",
      file_path: filePath,
      file_name: faydaFile.name,
      file_size: faydaFile.size,
      mime_type: typeCheck.detectedMime || faydaFile.type,
    });

    // 4. Insert timeline event
    await supabase.from("application_events").insert({
      application_id: newAppId,
      event_type: "submitted",
      new_value: "pending",
      actor: "applicant",
    });

    // 5. Send confirmation email to applicant via Resend
    try {
      await sendApplicationReceivedEmail(email, fullName, newAppId, courseApplied);
    } catch (emailErr) {
      console.warn("Failed to send application received email:", emailErr);
    }

    return { success: true, applicationId: newAppId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit application.";
    return { success: false, error: message };
  }
}

export async function submitPaymentProofAction(formData: FormData) {
  try {
    // Rate limiting
    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    const rl = rateLimit(`payment:${ip}`, RATE_LIMITS.paymentUpload);
    if (!rl.allowed) {
      return { success: false, error: "Too many upload attempts. Please try again later." };
    }

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

    // Server-side file validation
    const sizeCheck = validateFileSize(file.size, 5);
    if (!sizeCheck.valid) return { success: false, error: sizeCheck.error };

    const extCheck = checkDangerousExtension(file.name);
    if (!extCheck.safe) return { success: false, error: extCheck.error };

    const fileBuffer = await file.arrayBuffer();
    const typeCheck = validateFileType(fileBuffer, file.type);
    if (!typeCheck.valid) return { success: false, error: typeCheck.error };

    const cleanFileName = sanitizeFileName(file.name);
    const filePath = `${applicationId}/${cleanFileName}`;

    const supabase = createAdminClient();

    await supabase.storage.from("payment-proofs").upload(filePath, fileBuffer, {
      contentType: typeCheck.detectedMime || file.type,
      upsert: true,
    });

    await supabase.from("application_files").insert({
      application_id: applicationId,
      file_category: "payment_proof",
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: typeCheck.detectedMime || file.type,
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

    // Insert timeline events
    await supabase.from("application_events").insert([
      {
        application_id: applicationId,
        event_type: "payment_uploaded",
        new_value: paymentMethod,
        actor: "applicant",
      },
      {
        application_id: applicationId,
        event_type: "status_changed",
        old_value: "pending",
        new_value: "under_review",
        actor: "system",
      },
    ]);

    // Send payment received confirmation email via Resend
    try {
      const { data: applicant } = await supabase
        .from("applications")
        .select("email, full_name")
        .eq("id", applicationId)
        .single();
      if (applicant?.email) {
        await sendPaymentReceivedEmail(applicant.email, applicant.full_name || "Applicant", applicationId);
      }
    } catch (emailErr) {
      console.warn("Failed to send payment received email:", emailErr);
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to upload payment proof.";
    return { success: false, error: message };
  }
}

export async function submitContactMessageAction(formData: FormData) {
  try {
    // Rate limiting
    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    const rl = rateLimit(`contact:${ip}`, RATE_LIMITS.contactForm);
    if (!rl.allowed) {
      return { success: false, error: "Too many messages sent. Please try again later." };
    }

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
