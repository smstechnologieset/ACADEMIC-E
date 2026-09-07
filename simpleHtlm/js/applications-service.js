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

  // 3. SUBMIT NEW APPLICATION
  async submitApplication(appData, faydaFile, educationDocFile) {
    // Generate unique Application Reference
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const applicationId = `AE-2026-${randomSuffix}`;

    // Process uploaded files to data URLs for instant local viewing
    let faydaFileData = null;
    if (faydaFile) {
      try {
        faydaFileData = await this.fileToBase64(faydaFile);
      } catch (e) {
        console.warn("Fayda file reading error:", e);
      }
    }

    let educationDocData = null;
    if (educationDocFile) {
      try {
        educationDocData = await this.fileToBase64(educationDocFile);
      } catch (e) {
        console.warn("Education document file reading error:", e);
      }
    }

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
      
      // Verification Documents
      faydaIdNumber: (appData.faydaIdNumber || "FAYDA Document Attached").trim(),
      faydaFileName: faydaFile ? faydaFile.name : "",
      faydaFileUrl: faydaFileData || "assets/students.jpg",
      
      // Mandatory Education Documents / Transcripts
      educationDocName: educationDocFile ? educationDocFile.name : "",
      educationDocUrl: educationDocData || "assets/campus.jpg",
      
      signature: appData.signature || `${appData.firstName.trim()} ${appData.lastName.trim()}`,
      status: "pending",
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

    // 1. Save to Local Storage
    const apps = window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
    apps.unshift(newApplication);
    window.AcademicDB.setLocal(window.AcademicDB.keys.APPLICATIONS, apps);

    // 2. Set pending payment reference
    localStorage.setItem(window.AcademicDB.keys.PENDING_REF, applicationId);
    this.clearDraft();

    // 3. Attempt Supabase live insert if client exists
    if (window.AcademicDB.supabase) {
      try {
        await window.AcademicDB.supabase.from("applications").insert([{
          id: applicationId,
          first_name: newApplication.firstName,
          middle_name: newApplication.middleName,
          last_name: newApplication.lastName,
          full_name: newApplication.fullName,
          age: newApplication.age,
          phone: newApplication.phone,
          email: newApplication.email,
          full_address: newApplication.fullAddress,
          place: newApplication.place,
          qualification: newApplication.qualification,
          course_applied: newApplication.courseApplied,
          signature: newApplication.signature,
          status: "pending",
          created_at: newApplication.created_at
        }]);
      } catch (err) {
        console.warn("Supabase live write fallback:", err);
      }
    }

    return { success: true, applicationId };
  },

  // 4. GET APPLICATION FOR TRACKING OR PAYMENT
  getApplication(idOrEmail) {
    if (!idOrEmail) return null;
    const query = idOrEmail.trim().toLowerCase();
    const apps = window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
    
    return apps.find(a => 
      (a.id && a.id.toLowerCase() === query) ||
      (a.email && a.email.toLowerCase() === query)
    ) || null;
  },

  // 5. SUBMIT PAYMENT PROOF
  async submitPaymentProof(applicationId, paymentMethod, transactionRef, slipFile) {
    const apps = window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
    const idx = apps.findIndex(a => a.id.toLowerCase() === applicationId.toLowerCase().trim());
    
    if (idx === -1) {
      return { success: false, error: "Application not found." };
    }

    let slipDataUrl = null;
    if (slipFile) {
      try {
        slipDataUrl = await this.fileToBase64(slipFile);
      } catch (e) {
        console.warn("Slip file reading error:", e);
      }
    }

    const app = apps[idx];
    app.paymentMethod = paymentMethod;
    app.paymentRef = transactionRef.trim();
    app.paymentSlipName = slipFile ? slipFile.name : "";
    app.paymentSlipUrl = slipDataUrl || app.paymentSlipUrl || "assets/campus.jpg";
    app.status = "under_review";
    app.updated_at = new Date().toISOString();

    app.events.push({
      type: "payment_uploaded",
      title: "Payment Slip Uploaded",
      time: new Date().toISOString(),
      note: `Payment receipt submitted via ${paymentMethod} (Ref: ${transactionRef.trim()}). Admissions team notified.`
    });

    apps[idx] = app;
    window.AcademicDB.setLocal(window.AcademicDB.keys.APPLICATIONS, apps);

    // Clear the pending lock once slip is submitted
    localStorage.removeItem(window.AcademicDB.keys.PENDING_REF);

    return { success: true, application: app };
  },

  // 6. CANCEL APPLICATION & CLEAR LOCK
  cancelApplication(applicationId, emailConfirm) {
    const apps = window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
    const idx = apps.findIndex(a => a.id.toLowerCase() === applicationId.toLowerCase().trim());
    
    if (idx === -1) {
      return { success: false, error: "Application not found." };
    }

    const app = apps[idx];
    if (emailConfirm && app.email.toLowerCase() !== emailConfirm.toLowerCase().trim()) {
      return { success: false, error: "The provided confirmation email does not match the application record." };
    }

    app.status = "cancelled";
    app.updated_at = new Date().toISOString();
    app.events.push({
      type: "cancelled",
      title: "Application Cancelled",
      time: new Date().toISOString(),
      note: "Application was cancelled by the applicant. Pending lock cleared."
    });

    apps[idx] = app;
    window.AcademicDB.setLocal(window.AcademicDB.keys.APPLICATIONS, apps);

    // Clear pending lock
    localStorage.removeItem(window.AcademicDB.keys.PENDING_REF);

    return { success: true };
  }
};
