/**
 * Academic Excellence — Applications Service
 * Multi-Step Form State, File Validations, Submission, Tracking, Payment Proof & Cancellation
 */

window.ApplicationsService = {
  // 1. DRAFT MANAGEMENT
  saveDraft(formData) {
    try {
      const { captchaInput, signatureCanvas, ...safeData } = formData;
      localStorage.setItem(window.AcademicDB.keys.DRAFT_APP, JSON.stringify(safeData));
    } catch (e) {
      console.warn("Autosave draft failed", e);
    }
  },

  getDraft() {
    try {
      const raw = localStorage.getItem(window.AcademicDB.keys.DRAFT_APP);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  clearDraft() {
    try {
      localStorage.removeItem(window.AcademicDB.keys.DRAFT_APP);
    } catch (e) {}
  },

  // 2. FILE VALIDATION & BASE64 HELPER
  validateFile(file, allowedTypes = [".pdf", ".png", ".jpg", ".jpeg"], maxMb = 10) {
    if (!file) return { valid: false, error: "No file selected." };
    const name = file.name.toLowerCase();
    const hasValidExt = allowedTypes.some(ext => name.endsWith(ext));
    if (!hasValidExt) {
      return { valid: false, error: `Invalid format. Allowed file formats: ${allowedTypes.join(", ")}` };
    }
    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
      return { valid: false, error: `File exceeds maximum size of ${maxMb}MB.` };
    }
    return { valid: true, error: null };
  },

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  },

  formatBytes(bytes, decimals = 1) {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  },

  // Helper to upload files to Supabase Storage
  async uploadFileToSupabase(file, bucket, fileName) {
    if (!file) return null;
    try {
      const client = (window.AcademicDB && window.AcademicDB.supabase) || window.supabaseInstance;
      if (client && client.storage) {
        const { data, error } = await client.storage.from(bucket).upload(fileName, file, {
          cacheControl: "3600",
          upsert: true
        });
        if (!error && data) {
          const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(fileName);
          return publicUrlData?.publicUrl || null;
        }
      }
      const supabaseUrl = (window.AcademicDB && window.AcademicDB.SUPABASE_URL) || "https://tfmbmmtlppkzcxpndiym.supabase.co";
      const supabaseKey = (window.AcademicDB && window.AcademicDB.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";
      const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${encodeURIComponent(fileName)}`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "x-upsert": "true"
        },
        body: file
      });
      if (res.ok) {
        return `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodeURIComponent(fileName)}`;
      }
    } catch (e) {
      console.warn("Storage upload note:", e);
    }
    return null;
  },

  // Helper to record uploaded file in application_files table
  async recordApplicationFile(applicationId, category, filePath, fileName, fileSize, mimeType) {
    if (!filePath) return;
    try {
      const client = (window.AcademicDB && window.AcademicDB.supabase) || window.supabaseInstance;
      if (client && client.from) {
        await client.from("application_files").insert({
          application_id: applicationId,
          file_category: category,
          file_path: filePath,
          file_name: fileName || "document",
          file_size: fileSize || 0,
          mime_type: mimeType || "application/octet-stream"
        });
        return;
      }
      const supabaseUrl = (window.AcademicDB && window.AcademicDB.SUPABASE_URL) || "https://tfmbmmtlppkzcxpndiym.supabase.co";
      const supabaseKey = (window.AcademicDB && window.AcademicDB.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";
      await fetch(`${supabaseUrl}/rest/v1/application_files`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          application_id: applicationId,
          file_category: category,
          file_path: filePath,
          file_name: fileName || "document",
          file_size: fileSize || 0,
          mime_type: mimeType || "application/octet-stream"
        })
      });
    } catch (e) {
      console.warn("Record file note:", e);
    }
  },

  // 3. SUBMIT NEW APPLICATION
  async submitApplication(appData, faydaFile, educationDocFile) {
    // Generate standard unique Application Reference (e.g. AE-2K7X9B4M)
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let randomCode = "";
    for (let i = 0; i < 8; i++) {
      randomCode += chars[Math.floor(Math.random() * chars.length)];
    }
    const applicationId = `AE-${randomCode}`;

    // Store data URLs in sessionStorage (to prevent exceeding localStorage 5MB quota)
    let faydaFileData = "";
    if (faydaFile) {
      try {
        faydaFileData = await this.fileToBase64(faydaFile);
        if (faydaFileData && faydaFileData.length < 2500000) {
          sessionStorage.setItem("doc_fayda_" + applicationId, faydaFileData);
        }
      } catch (e) {
        console.warn("Fayda file reading error:", e);
      }
    }

    let educationDocData = "";
    if (educationDocFile) {
      try {
        educationDocData = await this.fileToBase64(educationDocFile);
        if (educationDocData && educationDocData.length < 2500000) {
          sessionStorage.setItem("doc_edu_" + applicationId, educationDocData);
        }
      } catch (e) {
        console.warn("Education document file reading error:", e);
      }
    }

    const todayDate = new Date().toISOString().split("T")[0];
    const signatureText = (appData.signature || `${appData.firstName.trim()} ${appData.lastName.trim()}`).trim();

    const newApplication = {
      id: applicationId,
      firstName: appData.firstName.trim(),
      middleName: (appData.middleName || "").trim(),
      lastName: appData.lastName.trim(),
      fullName: `${appData.firstName.trim()} ${(appData.middleName || "").trim()} ${appData.lastName.trim()}`.replace(/\s+/g, " "),
      age: parseInt(appData.age, 10),
      phone: appData.phone.trim(),
      email: appData.email.trim().toLowerCase(),
      fullAddress: (appData.fullAddress || appData.place || "Addis Ababa").trim(),
      place: (appData.place || "Addis Ababa").trim(),
      qualification: appData.qualification,
      previousInstitution: (appData.previousInstitution || "").trim(),
      fieldOfStudy: (appData.fieldOfStudy || "").trim(),
      courseApplied: appData.courseApplied,
      
      // Verification Documents metadata (avoid huge base64 strings in localStorage)
      faydaIdNumber: (appData.faydaIdNumber || "FAYDA Document Attached").trim(),
      faydaFileName: faydaFile ? faydaFile.name : "",
      faydaFileUrl: faydaFileData && faydaFileData.length < 200000 ? faydaFileData : "assets/students.jpg",
      
      // Mandatory Education Documents / Transcripts
      educationDocName: educationDocFile ? educationDocFile.name : "",
      educationDocUrl: educationDocData && educationDocData.length < 200000 ? educationDocData : "assets/campus.jpg",
      
      signature: signatureText,
      status: "pending",
      submission_date: todayDate,
      paymentMethod: "",
      paymentRef: "",
      paymentSlipName: "",
      paymentSlipUrl: "",
      internalNotes: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      events: [
        {
          type: "submitted",
          title: "Application Submitted",
          time: new Date().toISOString(),
          note: `Application registered for ${appData.courseApplied}. Pending application fee payment.`
        }
      ]
    };

    // 1. Save to Local & Session Storage
    try {
      const apps = window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
      const filtered = apps.filter(a => a.id !== applicationId);
      filtered.unshift(newApplication);
      window.AcademicDB.setLocal(window.AcademicDB.keys.APPLICATIONS, filtered);
    } catch (e) {
      console.warn("Local storage write error:", e);
    }

    try {
      localStorage.setItem(window.AcademicDB.keys.PENDING_REF, applicationId);
      sessionStorage.setItem("ae_current_app_" + applicationId, JSON.stringify(newApplication));
    } catch (e) {}

    this.clearDraft();

    // 2. Direct Live Supabase Insert / Upsert (resilient fallback)
    try {
      const supabaseUrl = (window.AcademicDB && window.AcademicDB.SUPABASE_URL) || "https://tfmbmmtlppkzcxpndiym.supabase.co";
      const supabaseKey = (window.AcademicDB && window.AcademicDB.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";

      const dbPayload = {
        id: applicationId,
        first_name: newApplication.firstName,
        middle_name: newApplication.middleName || "",
        last_name: newApplication.lastName,
        full_name: newApplication.fullName,
        age: isNaN(newApplication.age) ? null : newApplication.age,
        phone: newApplication.phone,
        email: newApplication.email,
        full_address: newApplication.fullAddress,
        place: newApplication.place,
        qualification: newApplication.qualification,
        course_applied: newApplication.courseApplied,
        signature: newApplication.signature,
        status: "pending",
        submission_date: todayDate
      };

      const client = (window.AcademicDB && window.AcademicDB.supabase) || window.supabaseInstance;
      let inserted = false;
      if (client && client.from) {
        const { error: insErr } = await client.from("applications").upsert(dbPayload);
        if (!insErr) inserted = true;
      }

      if (!inserted) {
        const res = await fetch(`${supabaseUrl}/rest/v1/applications`, {
          method: "POST",
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=representation"
          },
          body: JSON.stringify(dbPayload)
        });

        if (!res.ok) {
          console.warn("Supabase insert note:", await res.text());
        }
      }

      // Upload documents to Supabase Storage and record file metadata before returning
      const uploadTasks = [];
      if (faydaFile) {
        uploadTasks.push((async () => {
          try {
            const url = await this.uploadFileToSupabase(faydaFile, "documents", `${applicationId}_fayda_${faydaFile.name.replace(/\s+/g, "_")}`);
            if (url) {
              newApplication.faydaFileUrl = url;
              newApplication.faydaFileName = faydaFile.name;
              await this.recordApplicationFile(applicationId, "fayda_id", url, faydaFile.name, faydaFile.size, faydaFile.type);
            }
          } catch (e) {
            console.warn("Fayda upload error:", e);
          }
        })());
      }
      if (educationDocFile) {
        uploadTasks.push((async () => {
          try {
            const url = await this.uploadFileToSupabase(educationDocFile, "documents", `${applicationId}_edu_${educationDocFile.name.replace(/\s+/g, "_")}`);
            if (url) {
              newApplication.educationDocUrl = url;
              newApplication.educationDocName = educationDocFile.name;
              await this.recordApplicationFile(applicationId, "document", url, educationDocFile.name, educationDocFile.size, educationDocFile.type);
            }
          } catch (e) {
            console.warn("Education doc upload error:", e);
          }
        })());
      }

      if (uploadTasks.length > 0) {
        await Promise.all(uploadTasks);
      }

      // Update local and session storage with final document URLs
      try {
        const apps = window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
        const idx = apps.findIndex(a => a.id === applicationId);
        if (idx !== -1) apps[idx] = newApplication;
        else apps.unshift(newApplication);
        window.AcademicDB.setLocal(window.AcademicDB.keys.APPLICATIONS, apps);
        sessionStorage.setItem("ae_current_app_" + applicationId, JSON.stringify(newApplication));
      } catch (e) {}
    } catch (err) {
      console.warn("Supabase network insert error:", err);
    }

    // Send application received email via server API
    if (newApplication.email) {
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "application_received",
          to: newApplication.email,
          name: newApplication.fullName || newApplication.firstName || "Applicant",
          refId: applicationId,
          course: newApplication.courseApplied || "Academic Program"
        })
      }).catch(err => console.info("Email notification queued:", err));
    }

    return { success: true, applicationId };
  },

  // 4. GET APPLICATION (SYNCHRONOUS CACHE)
  getApplication(idOrEmail) {
    if (!idOrEmail) return null;
    const clean = idOrEmail.trim();
    const query = clean.toLowerCase();

    // 1. Session Storage
    try {
      const sessionApp = sessionStorage.getItem("ae_current_app_" + clean);
      if (sessionApp) return JSON.parse(sessionApp);
    } catch (e) {}

    // 2. Local Storage
    const apps = window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
    return apps.find(a => 
      (a.id && a.id.toLowerCase() === query) ||
      (a.email && a.email.toLowerCase() === query)
    ) || null;
  },

  // 4B. GET APPLICATION ASYNC (SUPABASE LIVE + LOCAL FALLBACK)
  async getApplicationAsync(idOrEmail) {
    if (!idOrEmail) return null;
    const clean = idOrEmail.trim();
    const query = clean.toLowerCase();

    // 1. Query Supabase database FIRST so status changes (like rejection or approval) reflect in real-time
    try {
      const supabaseUrl = (window.AcademicDB && window.AcademicDB.SUPABASE_URL) || "https://tfmbmmtlppkzcxpndiym.supabase.co";
      const supabaseKey = (window.AcademicDB && window.AcademicDB.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";

      const headers = {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`
      };

      let row = null;

      // Try by ID first (exact match, case-insensitive)
      const resId = await fetch(
        `${supabaseUrl}/rest/v1/applications?id=ilike.${encodeURIComponent(clean)}&limit=1`,
        { headers }
      );
      if (resId.ok) {
        const rows = await resId.json();
        if (Array.isArray(rows) && rows.length > 0) row = rows[0];
      }

      // If not found by ID, try by email
      if (!row && clean.includes("@")) {
        const resEmail = await fetch(
          `${supabaseUrl}/rest/v1/applications?email=ilike.${encodeURIComponent(clean)}&limit=1`,
          { headers }
        );
        if (resEmail.ok) {
          const rows = await resEmail.json();
          if (Array.isArray(rows) && rows.length > 0) row = rows[0];
        }
      }

      if (row) {
        // Extract rejection reason if stored in internal_notes
        let rejectionReason = row.rejection_reason || "";
        const rawNotes = row.internal_notes || "";
        if (!rejectionReason && rawNotes.includes("[Rejection Reason]:")) {
          const match = rawNotes.match(/\[Rejection Reason\]:\s*([^\n]+(?:\n(?!(?:\[Internal Notes\]:)))*)/i);
          if (match && match[1]) {
            rejectionReason = match[1].trim();
          }
        }

        const mapped = {
          id: row.id,
          firstName: row.first_name || "",
          middleName: row.middle_name || "",
          lastName: row.last_name || "",
          fullName: row.full_name || `${row.first_name || ""} ${row.last_name || ""}`.trim(),
          age: row.age || "—",
          phone: row.phone || "",
          email: row.email || "",
          fullAddress: row.full_address || row.place || "Addis Ababa",
          place: row.place || "Addis Ababa",
          courseApplied: row.course_applied || "General Track",
          qualification: row.qualification || "",
          status: row.status || "pending",
          paymentMethod: row.payment_method || "",
          paymentRef: row.transaction_ref || "",
          internalNotes: rawNotes,
          rejectionReason: rejectionReason,
          created_at: row.created_at || new Date().toISOString(),
          updated_at: row.updated_at || new Date().toISOString()
        };

        // Construct event history
        mapped.events = [
          {
            type: "submitted",
            title: "Application Submitted",
            time: mapped.created_at,
            note: `Candidate applied for ${mapped.courseApplied}.`
          }
        ];

        if (mapped.paymentMethod || mapped.paymentRef || mapped.status === "under_review" || mapped.status === "approved" || mapped.status === "rejected") {
          mapped.events.push({
            type: "payment_uploaded",
            title: "Payment Slip Uploaded",
            time: mapped.updated_at || mapped.created_at,
            note: `Proof submitted via ${mapped.paymentMethod || "Bank / Mobile"} (Ref: ${mapped.paymentRef || "Verified"}).`
          });
        }

        if (mapped.status === "approved") {
          mapped.events.push({
            type: "approved",
            title: "Application Approved",
            time: mapped.updated_at,
            note: "Admissions verification completed successfully. Placement confirmed."
          });
        } else if (mapped.status === "rejected") {
          mapped.events.push({
            type: "rejected",
            title: "Application Rejected",
            time: mapped.updated_at,
            note: rejectionReason ? `Reason: ${rejectionReason}` : "Admissions criteria not met for this intake cycle."
          });
        } else if (mapped.status === "cancelled") {
          mapped.events.push({
            type: "cancelled",
            title: "Application Cancelled",
            time: mapped.updated_at,
            note: "Application was cancelled by the applicant."
          });
        }

        // Cache fresh data in sessionStorage and localStorage
        try {
          sessionStorage.setItem("ae_current_app_" + mapped.id, JSON.stringify(mapped));
        } catch (e) {}
        const apps = window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
        const filtered = apps.filter(a => a.id && a.id.toLowerCase() !== mapped.id.toLowerCase());
        filtered.unshift(mapped);
        window.AcademicDB.setLocal(window.AcademicDB.keys.APPLICATIONS, filtered);

        return mapped;
      }
    } catch (e) {
      console.warn("Supabase fetch application error:", e);
    }

    // 2. Fallback to Local / Session cache ONLY if Supabase is offline or not found
    const cached = this.getApplication(clean);
    if (cached) return cached;

    return null;
  },

  // 5. SUBMIT PAYMENT PROOF
  async submitPaymentProof(applicationId, paymentMethod, transactionRef, slipFile) {
    const cleanId = (applicationId || "").trim();
    const apps = window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
    const idx = apps.findIndex(a => a.id.toLowerCase() === cleanId.toLowerCase());

    let slipDataUrl = null;
    if (slipFile) {
      try {
        slipDataUrl = await this.fileToBase64(slipFile);
        if (slipDataUrl && slipDataUrl.length < 2500000) {
          sessionStorage.setItem("slip_" + cleanId, slipDataUrl);
        }
      } catch (e) {
        console.warn("Slip file reading error:", e);
      }
    }

    let targetApp = null;
    if (idx !== -1) {
      const app = apps[idx];
      app.paymentMethod = paymentMethod;
      app.paymentRef = transactionRef.trim();
      app.paymentSlipName = slipFile ? slipFile.name : "";
      app.paymentSlipUrl = slipDataUrl && slipDataUrl.length < 200000 ? slipDataUrl : "assets/campus.jpg";
      app.status = "under_review";
      app.updated_at = new Date().toISOString();

      if (!app.events) app.events = [];
      app.events.push({
        type: "payment_uploaded",
        title: "Payment Slip Uploaded",
        time: new Date().toISOString(),
        note: `Payment receipt submitted via ${paymentMethod} (Ref: ${transactionRef.trim()}). Admissions team notified.`
      });

      apps[idx] = app;
      window.AcademicDB.setLocal(window.AcademicDB.keys.APPLICATIONS, apps);
      sessionStorage.setItem("ae_current_app_" + cleanId, JSON.stringify(app));
      targetApp = app;
    } else {
      // If not in local array, retrieve from cache or async storage
      targetApp = this.getApplication(cleanId);
    }

    // Live update / upsert in Supabase
    try {
      const supabaseUrl = (window.AcademicDB && window.AcademicDB.SUPABASE_URL) || "https://tfmbmmtlppkzcxpndiym.supabase.co";
      const supabaseKey = (window.AcademicDB && window.AcademicDB.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";

      // Upload payment slip to Supabase Storage if file is provided
      let slipUrl = null;
      if (slipFile) {
        slipUrl = await this.uploadFileToSupabase(slipFile, "payment-proofs", `${cleanId}_slip_${slipFile.name.replace(/\s+/g, "_")}`);
        if (slipUrl) {
          await this.recordApplicationFile(cleanId, "payment_proof", slipUrl, slipFile.name, slipFile.size, slipFile.type);
        }
      }

      const client = (window.AcademicDB && window.AcademicDB.supabase) || window.supabaseInstance;
      const patchPayload = {
        payment_method: paymentMethod,
        transaction_ref: transactionRef.trim(),
        status: "under_review",
        updated_at: new Date().toISOString()
      };

      let patched = false;
      if (client && client.from) {
        const { data, error } = await client.from("applications").update(patchPayload).eq("id", cleanId).select();
        if (!error && data && data.length > 0) patched = true;
      }

      if (!patched) {
        const res = await fetch(`${supabaseUrl}/rest/v1/applications?id=eq.${encodeURIComponent(cleanId)}`, {
          method: "PATCH",
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
          },
          body: JSON.stringify(patchPayload)
        });
        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0) patched = true;
        }
      }

      // CRITICAL RESILIENCE FALLBACK: If application row did not exist in Supabase yet, UPSERT the full record
      if (!patched && targetApp) {
        const fullPayload = {
          id: cleanId,
          first_name: targetApp.firstName || "Applicant",
          middle_name: targetApp.middleName || "",
          last_name: targetApp.lastName || "Candidate",
          full_name: targetApp.fullName || `${targetApp.firstName || ""} ${targetApp.lastName || ""}`.trim(),
          age: isNaN(targetApp.age) ? null : targetApp.age,
          phone: targetApp.phone || "",
          email: targetApp.email || "",
          full_address: targetApp.fullAddress || targetApp.place || "Addis Ababa",
          place: targetApp.place || "Addis Ababa",
          qualification: targetApp.qualification || "Completed Degree",
          course_applied: targetApp.courseApplied || "Selected Intake Track",
          signature: targetApp.signature || targetApp.fullName || "Applicant",
          status: "under_review",
          payment_method: paymentMethod,
          transaction_ref: transactionRef.trim(),
          submission_date: targetApp.submission_date || new Date().toISOString().split("T")[0],
          created_at: targetApp.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (client && client.from) {
          await client.from("applications").upsert(fullPayload);
        } else {
          await fetch(`${supabaseUrl}/rest/v1/applications`, {
            method: "POST",
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              "Prefer": "resolution=merge-duplicates"
            },
            body: JSON.stringify(fullPayload)
          });
        }
      }
    } catch (e) {
      console.warn("Supabase patch payment proof error:", e);
    }

    // Clear the pending lock once slip is submitted
    localStorage.removeItem(window.AcademicDB.keys.PENDING_REF);
    localStorage.removeItem("ae_pending_payment_ref");

    // Send payment proof received email via server API
    if (targetApp && targetApp.email) {
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payment_received",
          to: targetApp.email,
          name: targetApp.fullName || targetApp.firstName || "Applicant",
          refId: cleanId
        })
      }).catch(err => console.info("Email notification queued:", err));
    }

    return { success: true, application: targetApp };
  },

  // 6. CANCEL APPLICATION & CLEAR LOCK
  async cancelApplication(applicationId, emailConfirm) {
    const cleanId = (applicationId || "").toLowerCase().trim();
    const emailNormalized = (emailConfirm || "").toLowerCase().trim();

    // 1. Check local storage applications
    const apps = window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
    const idx = apps.findIndex(a => a.id && a.id.toLowerCase() === cleanId);
    let appFound = null;

    if (idx !== -1) {
      appFound = apps[idx];
      if (emailNormalized && appFound.email && appFound.email.toLowerCase().trim() !== emailNormalized) {
        return { success: false, error: "The provided confirmation email does not match the application record." };
      }
      appFound.status = "cancelled";
      appFound.updated_at = new Date().toISOString();
      if (!appFound.events) appFound.events = [];
      appFound.events.push({
        type: "cancelled",
        title: "Application Cancelled",
        time: new Date().toISOString(),
        note: "Application was cancelled by the applicant. Pending lock cleared."
      });
      apps[idx] = appFound;
      window.AcademicDB.setLocal(window.AcademicDB.keys.APPLICATIONS, apps);
    }

    // 2. Sync cancellation to Supabase if connected
    if (window.supabaseClient) {
      try {
        const { data: supaApp } = await window.supabaseClient
          .from("applications")
          .select("id, email")
          .ilike("id", cleanId)
          .maybeSingle();

        if (supaApp) {
          if (emailNormalized && supaApp.email && supaApp.email.toLowerCase().trim() !== emailNormalized) {
            return { success: false, error: "The provided confirmation email does not match the application record." };
          }
          await window.supabaseClient
            .from("applications")
            .update({
              status: "cancelled",
              notes: "Cancelled by applicant from payment page."
            })
            .eq("id", supaApp.id);
        }
      } catch (err) {
        console.warn("Supabase cancel sync warning:", err);
      }
    }

    // 3. Clear pending lock
    localStorage.removeItem(window.AcademicDB.keys.PENDING_REF);
    localStorage.removeItem("ae_pending_payment_ref");

    return { success: true };
  }
};
