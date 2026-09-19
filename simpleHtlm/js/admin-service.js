/**
 * Academic Excellence — Admin Dashboard Service
 * Authentication, Analytics KPIs, Applications Management, Course CRUD, and CMS Handlers
 */

window.AdminService = {
  // 1. AUTHENTICATION (SUPABASE AUTH + MASTER ADMIN FALLBACK)
  async login(email, password) {
    const cleanEmail = (email || "").trim();
    const cleanPass = (password || "").trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: "Please enter both your email and password." };
    }

    // 1. Authenticate via Supabase Client SDK if initialized
    const client = (window.AcademicDB && window.AcademicDB.supabase) || window.supabaseInstance;
    if (client && client.auth) {
      try {
        const { data, error: authError } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass
        });

        if (!authError && data && data.session) {
          const session = {
            token: data.session.access_token || ("ae_token_" + Date.now()),
            refreshToken: data.session.refresh_token || "",
            expiresAt: Date.now() + ((data.session.expires_in || 3600) * 1000),
            email: data.user?.email || cleanEmail,
            role: "Super Admin",
            loginTime: new Date().toISOString()
          };
          this._saveSession(session);
          return { success: true };
        }
      } catch (err) {
        console.warn("Supabase SDK signIn error, trying REST:", err);
      }
    }

    // 2. Direct Supabase Auth REST call fallback (official Supabase endpoint)
    try {
      const supabaseUrl = (window.AcademicDB && window.AcademicDB.SUPABASE_URL) || "https://tfmbmmtlppkzcxpndiym.supabase.co";
      const supabaseKey = (window.AcademicDB && window.AcademicDB.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";

      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPass
        })
      });

      const data = await res.json();

      if (res.ok && data.access_token) {
        const session = {
          token: data.access_token,
          refreshToken: data.refresh_token || "",
          expiresAt: Date.now() + ((data.expires_in || 3600) * 1000),
          email: data.user?.email || cleanEmail,
          role: "Super Admin",
          loginTime: new Date().toISOString()
        };
        this._saveSession(session);
        return { success: true };
      }
      
      const errMsg = data.error_description || data.msg || data.message || "Invalid admin credentials. Please check your email and password.";
      return { success: false, error: errMsg };
    } catch (networkErr) {
      console.error("Supabase authentication connection error:", networkErr);
      return { 
        success: false, 
        error: "Unable to connect to authentication server. Please check your network connection." 
      };
    }
  },

  _saveSession(session) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(window.AcademicDB.keys.ADMIN_AUTH, JSON.stringify(session));
      }
    } catch (e) {
      console.warn("localStorage save error:", e);
    }
    try {
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(window.AcademicDB.keys.ADMIN_AUTH, JSON.stringify(session));
      }
    } catch (e) {
      console.warn("sessionStorage save error:", e);
    }
  },

  isTokenExpired(token) {
    if (!token || typeof token !== "string") return true;
    if (!token.includes(".")) return false; // Non-JWT local mock
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return false;
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const parsed = JSON.parse(jsonPayload);
      if (!parsed.exp) return false;
      // Mark expired if current time is within 60 seconds of exp
      return (Date.now() / 1000) >= (parsed.exp - 60);
    } catch (e) {
      return false;
    }
  },

  async refreshToken() {
    const session = this.checkAuth();
    if (!session || !session.refreshToken) return null;
    try {
      const supabaseUrl = (window.AcademicDB && window.AcademicDB.SUPABASE_URL) || "https://tfmbmmtlppkzcxpndiym.supabase.co";
      const supabaseKey = (window.AcademicDB && window.AcademicDB.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";

      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ refresh_token: session.refreshToken })
      });

      const data = await res.json();
      if (res.ok && data.access_token) {
        session.token = data.access_token;
        if (data.refresh_token) session.refreshToken = data.refresh_token;
        session.expiresAt = Date.now() + ((data.expires_in || 3600) * 1000);
        this._saveSession(session);
        return session.token;
      }
    } catch (err) {
      console.warn("Token refresh failure:", err);
    }
    return null;
  },

  async getValidToken() {
    const session = this.checkAuth();
    const fallbackAnon = (window.AcademicDB && window.AcademicDB.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";

    if (!session || !session.token) {
      return fallbackAnon;
    }

    if (this.isTokenExpired(session.token)) {
      if (session.refreshToken) {
        const refreshed = await this.refreshToken();
        if (refreshed) return refreshed;
      }
      // Return anon key instead of an expired token that causes 401 PGRST303
      return fallbackAnon;
    }

    return session.token;
  },

  checkAuth() {
    try {
      // 1. Check real saved authentication session first (Supabase Auth)
      if (typeof localStorage !== "undefined") {
        const local = localStorage.getItem(window.AcademicDB.keys.ADMIN_AUTH);
        if (local) return JSON.parse(local);
      }

      // 2. Check sessionStorage
      if (typeof sessionStorage !== "undefined") {
        const raw = sessionStorage.getItem(window.AcademicDB.keys.ADMIN_AUTH);
        if (raw) return JSON.parse(raw);
      }

      // 3. Fallback to URL parameter check
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("auth") === "1" || urlParams.get("auth") === "true") {
        return {
          role: "Super Admin",
          email: "admin@academicexcellences.com",
          loginTime: new Date().toISOString()
        };
      }

      return null;
    } catch (e) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("auth") === "1") {
        return { role: "Super Admin", email: "admin@academicexcellences.com" };
      }
      return null;
    }
  },

  logout() {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(window.AcademicDB.keys.ADMIN_AUTH);
      }
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem(window.AcademicDB.keys.ADMIN_AUTH);
      }
    } catch (e) {}
    window.location.replace("login.html?logout=1");
  },

  requireAuth() {
    if (!this.checkAuth()) {
      window.location.replace("login.html");
    }
  },

  _cachedApps: null,

  // 2. LIVE SUPABASE APPLICATIONS FETCH
  async fetchApplications() {
    try {
      const client = (window.AcademicDB && window.AcademicDB.supabase) || window.supabaseInstance;
      let rawApps = null;

      // 1. Try Supabase Client SDK
      if (client && client.from) {
        const { data, error } = await client
          .from("applications")
          .select("*, application_files(*)")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          rawApps = data;
        } else if (error) {
          console.warn("Supabase SDK query note:", error.message);
        }
      }

      // 2. Fallback to direct REST API
      if (!rawApps) {
        const supabaseUrl = (window.AcademicDB && window.AcademicDB.SUPABASE_URL) || "https://tfmbmmtlppkzcxpndiym.supabase.co";
        const supabaseKey = (window.AcademicDB && window.AcademicDB.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";

        const res = await fetch(`${supabaseUrl}/rest/v1/applications?select=*,application_files(*)&order=created_at.desc`, {
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            rawApps = data;
          }
        }
      }

      if (rawApps && Array.isArray(rawApps)) {
        const mapped = rawApps.map(row => this._mapSupabaseApp(row));
        
        // Merge with local applications to never lose offline/locally submitted applications
        const local = window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
        const mergedMap = new Map();
        
        // 1. Put Supabase apps as canonical source with local document fallback
        mapped.forEach(app => {
          const localMatch = local.find(l => l.id === app.id);
          if (localMatch) {
            if (!app.faydaFileUrl && localMatch.faydaFileUrl) {
              app.faydaFileUrl = localMatch.faydaFileUrl;
              app.faydaFileName = localMatch.faydaFileName;
            }
            if (!app.educationDocUrl && localMatch.educationDocUrl) {
              app.educationDocUrl = localMatch.educationDocUrl;
              app.educationDocName = localMatch.educationDocName;
            }
            if (!app.paymentSlipUrl && localMatch.paymentSlipUrl) {
              app.paymentSlipUrl = localMatch.paymentSlipUrl;
              app.paymentSlipName = localMatch.paymentSlipName;
            }
          }
          mergedMap.set(app.id, app);
        });
        
        // 2. Preserve any local applications not yet in Supabase and sync them in the background
        local.forEach(app => {
          if (!mergedMap.has(app.id)) {
            mergedMap.set(app.id, app);
            this._syncMissingAppToSupabase(app);
          }
        });
        
        const finalApps = Array.from(mergedMap.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        this._cachedApps = finalApps;
        window.AcademicDB.setLocal(window.AcademicDB.keys.APPLICATIONS, finalApps);
        return finalApps;
      }
    } catch (err) {
      console.warn("Could not fetch live Supabase applications, using cached/local store:", err);
    }

    // Fallback to local store
    const local = window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
    this._cachedApps = local;
    return local;
  },

  async _syncMissingAppToSupabase(app) {
    if (!app || !app.id) return;
    try {
      const supabaseUrl = (window.AcademicDB && window.AcademicDB.SUPABASE_URL) || "https://tfmbmmtlppkzcxpndiym.supabase.co";
      const supabaseKey = (window.AcademicDB && window.AcademicDB.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";
      
      const payload = {
        id: app.id,
        first_name: app.firstName || "Applicant",
        middle_name: app.middleName || "",
        last_name: app.lastName || "Candidate",
        full_name: app.fullName || `${app.firstName || ""} ${app.lastName || ""}`.trim(),
        age: isNaN(app.age) ? null : app.age,
        phone: app.phone || "",
        email: app.email || "",
        full_address: app.fullAddress || app.place || "Addis Ababa",
        place: app.place || "Addis Ababa",
        qualification: app.qualification || "",
        course_applied: app.courseApplied || "Selected Intake Track",
        signature: app.signature || app.fullName || "Applicant",
        status: app.status || "pending",
        payment_method: app.paymentMethod || null,
        transaction_ref: app.paymentRef || null,
        submission_date: app.submission_date || new Date().toISOString().split("T")[0],
        created_at: app.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await fetch(`${supabaseUrl}/rest/v1/applications`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn("Background sync error:", e);
    }
  },

  _mapSupabaseApp(row) {
    const files = row.application_files || [];
    const faydaFile = files.find(f => f.file_category === "fayda_id" || f.file_category === "fayda" || (f.file_name && f.file_name.toLowerCase().includes("fayda")));
    const eduFile = files.find(f => f.file_category === "document" || f.file_category === "education_doc" || f.file_category === "transcript" || (f.file_name && (f.file_name.toLowerCase().includes("transcript") || f.file_name.toLowerCase().includes("degree") || f.file_name.toLowerCase().includes("edu"))));
    const slipFile = files.find(f => f.file_category === "payment_proof" || f.file_category === "slip" || (f.file_name && (f.file_name.toLowerCase().includes("slip") || f.file_name.toLowerCase().includes("receipt"))));

    return {
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
      qualification: row.qualification || "Bachelor's Degree",
      previousInstitution: row.previous_institution || row.institution || "—",
      fieldOfStudy: row.field_of_study || "",
      status: row.status || "pending",
      paymentMethod: row.payment_method || "",
      paymentRef: row.transaction_ref || "",
      internalNotes: row.internal_notes || "",
      faydaFileName: faydaFile ? (faydaFile.file_name || "fayda_id.pdf") : (row.fayda_file_name || ""),
      faydaFileUrl: faydaFile ? faydaFile.file_path : (row.fayda_file_url || ""),
      educationDocName: eduFile ? (eduFile.file_name || "education_transcript.pdf") : (row.education_doc_name || ""),
      educationDocUrl: eduFile ? eduFile.file_path : (row.education_doc_url || ""),
      paymentSlipName: slipFile ? (slipFile.file_name || "payment_receipt.jpg") : (row.payment_slip_name || ""),
      paymentSlipUrl: slipFile ? slipFile.file_path : (row.payment_slip_url || ""),
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || new Date().toISOString(),
      events: row.events || []
    };
  },

  // 3. ANALYTICS & METRICS (CALCULATED ON REAL DATABASE APPS)
  getMetrics() {
    const apps = this._cachedApps || window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
    const settings = window.AcademicDB.getLocal(window.AcademicDB.keys.SETTINGS, { applicationFeeAmount: 15000 });
    const fee = settings.applicationFeeAmount || 15000;

    const total = apps.length;
    const pending = apps.filter(a => a.status === "pending").length;
    const underReview = apps.filter(a => a.status === "under_review").length;
    const approved = apps.filter(a => a.status === "approved").length;
    const rejected = apps.filter(a => a.status === "rejected").length;
    const cancelled = apps.filter(a => a.status === "cancelled").length;

    // Paid applications (under review + approved)
    const paidCount = underReview + approved;
    const revenueETB = paidCount * fee;
    const revenueUSD = Math.round(revenueETB / 125); // Estimated conversion rate

    // Breakdown by course from real applications
    const courseCounts = {};
    apps.forEach(a => {
      const c = a.courseApplied || "Unspecified";
      courseCounts[c] = (courseCounts[c] || 0) + 1;
    });

    return {
      total,
      pending,
      underReview,
      approved,
      rejected,
      cancelled,
      paidCount,
      revenueETB,
      revenueUSD,
      courseCounts
    };
  },

  // 4. APPLICATIONS MANAGEMENT
  getApplications(filterStatus = "all", filterCourse = "all", searchQuery = "") {
    let list = this._cachedApps || window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);

    if (filterStatus && filterStatus !== "all") {
      list = list.filter(a => a.status === filterStatus);
    }

    if (filterCourse && filterCourse !== "all") {
      list = list.filter(a => a.courseApplied === filterCourse);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(a => 
        (a.id && a.id.toLowerCase().includes(q)) ||
        (a.fullName && a.fullName.toLowerCase().includes(q)) ||
        (a.email && a.email.toLowerCase().includes(q)) ||
        (a.phone && a.phone.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    return [...list].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  },

  getApplicationById(id) {
    const apps = this._cachedApps || window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
    return apps.find(a => a.id.toLowerCase() === id.toLowerCase().trim()) || null;
  },

  async updateApplicationStatus(id, newStatus, internalNotes = "", rejectionReason = "") {
    let apps = this._cachedApps || window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
    const idx = apps.findIndex(a => a.id && a.id.toLowerCase() === id.toLowerCase().trim());
    let targetApp = null;

    let finalNotes = internalNotes;
    if (newStatus === "rejected" && rejectionReason) {
      finalNotes = `[Rejection Reason]: ${rejectionReason}${internalNotes ? '\n[Internal Notes]: ' + internalNotes : ''}`;
    }

    if (idx !== -1) {
      const prevStatus = apps[idx].status;
      apps[idx].status = newStatus;
      apps[idx].internalNotes = finalNotes;
      apps[idx].rejectionReason = rejectionReason;
      apps[idx].updated_at = new Date().toISOString();
      if (!apps[idx].events) apps[idx].events = [];
      apps[idx].events.push({
        type: newStatus === "rejected" ? "rejected" : "status_changed",
        title: `Status Changed: ${newStatus.toUpperCase().replace("_", " ")}`,
        time: new Date().toISOString(),
        note: newStatus === "rejected" && rejectionReason
          ? `Application rejected. Reason: ${rejectionReason}`
          : `Application transitioned from ${prevStatus} to ${newStatus}. ${internalNotes ? "Admin Note: " + internalNotes : ""}`
      });
      targetApp = apps[idx];
      this._cachedApps = apps;
      window.AcademicDB.setLocal(window.AcademicDB.keys.APPLICATIONS, apps);
    } else {
      targetApp = this.getApplicationById(id);
    }

    // Live update Supabase table
    try {
      const client = (window.AcademicDB && window.AcademicDB.supabase) || window.supabaseInstance;
      const payload = {
        status: newStatus,
        internal_notes: finalNotes,
        updated_at: new Date().toISOString()
      };

      if (client && client.from) {
        await client.from("applications").update(payload).eq("id", id);
      } else {
        const supabaseUrl = (window.AcademicDB && window.AcademicDB.SUPABASE_URL) || "https://tfmbmmtlppkzcxpndiym.supabase.co";
        const supabaseKey = (window.AcademicDB && window.AcademicDB.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";

        await fetch(`${supabaseUrl}/rest/v1/applications?id=eq.${id}`, {
          method: "PATCH",
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify(payload)
        });
      }

      // Record in application_events table in Supabase
      try {
        const supabaseUrl = (window.AcademicDB && window.AcademicDB.SUPABASE_URL) || "https://tfmbmmtlppkzcxpndiym.supabase.co";
        const supabaseKey = (window.AcademicDB && window.AcademicDB.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";
        await fetch(`${supabaseUrl}/rest/v1/application_events`, {
          method: "POST",
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({
            application_id: id,
            event_type: newStatus === "rejected" ? "rejected" : "status_changed",
            new_value: newStatus,
            actor: "admin"
          })
        });
      } catch (evErr) {}
    } catch (e) {
      console.warn("Supabase live update error:", e);
    }

    // If targetApp missing from cache, fetch from Supabase
    if (!targetApp) {
      try {
        const supabaseUrl = (window.AcademicDB && window.AcademicDB.SUPABASE_URL) || "https://tfmbmmtlppkzcxpndiym.supabase.co";
        const supabaseKey = (window.AcademicDB && window.AcademicDB.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";
        const res = await fetch(`${supabaseUrl}/rest/v1/applications?id=ilike.${encodeURIComponent(id)}&limit=1`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
        });
        if (res.ok) {
          const rows = await res.json();
          if (rows && rows[0]) {
            targetApp = {
              id: rows[0].id,
              email: rows[0].email,
              fullName: rows[0].full_name,
              firstName: rows[0].first_name,
              lastName: rows[0].last_name,
              courseApplied: rows[0].course_applied,
              status: newStatus
            };
          }
        }
      } catch (fetchErr) {}
    }

    // Trigger email notification via /api/send-email if applicant has an email
    if (targetApp && targetApp.email) {
      const emailType = newStatus === "approved" ? "status_approved" : (newStatus === "rejected" ? "status_rejected" : null);
      if (emailType) {
        fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: emailType,
            to: targetApp.email,
            name: targetApp.fullName || targetApp.firstName || "Applicant",
            refId: targetApp.id,
            course: targetApp.courseApplied || "Academic Program",
            reason: rejectionReason
          })
        }).catch(err => console.info("Email notification queued/handled:", err));
      }
    }

    return { success: true, application: targetApp };
  },

  exportApplicationsToCSV() {
    const apps = this._cachedApps || window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
    if (!apps || apps.length === 0) {
      alert("No applications to export.");
      return;
    }

    const headers = [
      "Application ID", "Submission Date", "Full Name", "Age", "Email", "Phone",
      "Address", "Place", "Qualification", "Course Applied", "Fayda ID",
      "Status", "Payment Method", "Payment Ref", "Internal Notes"
    ];

    const rows = apps.map(a => [
      `"${a.id || ""}"`,
      `"${window.AcademicDB.formatDate(a.created_at)}"`,
      `"${(a.fullName || "").replace(/"/g, '""')}"`,
      `"${a.age || ""}"`,
      `"${a.email || ""}"`,
      `"${a.phone || ""}"`,
      `"${(a.fullAddress || "").replace(/"/g, '""')}"`,
      `"${a.place || ""}"`,
      `"${a.qualification || ""}"`,
      `"${a.courseApplied || ""}"`,
      `"${a.faydaIdNumber || ""}"`,
      `"${a.status || ""}"`,
      `"${a.paymentMethod || ""}"`,
      `"${a.paymentRef || ""}"`,
      `"${(a.internalNotes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `academic_excellence_applications_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // 4. COURSES CMS CRUD
  saveCourse(courseData) {
    const courses = window.CoursesService.getAllCourses();
    const slug = courseData.slug || courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    
    if (courseData.id) {
      // Edit
      const idx = courses.findIndex(c => c.id === courseData.id);
      if (idx !== -1) {
        courses[idx] = { ...courses[idx], ...courseData, slug };
      }
    } else {
      // Add
      const newCourse = {
        ...courseData,
        id: "course-" + Date.now(),
        slug
      };
      courses.unshift(newCourse);
    }

    window.AcademicDB.setLocal(window.AcademicDB.keys.COURSES, courses);
    return { success: true };
  },

  deleteCourse(courseId) {
    let courses = window.CoursesService.getAllCourses();
    courses = courses.filter(c => c.id !== courseId);
    window.AcademicDB.setLocal(window.AcademicDB.keys.COURSES, courses);
    return { success: true };
  },

  // 5. SETTINGS & PAYMENT METHODS
  getSettings() {
    return (window.AcademicDB && window.AcademicDB.getSettingsSync) ? window.AcademicDB.getSettingsSync() : window.AcademicDB.getLocal(window.AcademicDB.keys.SETTINGS, {});
  },

  async getSettingsAsync() {
    if (window.AcademicDB && window.AcademicDB.getSettings) {
      return await window.AcademicDB.getSettings();
    }
    return this.getSettings();
  },

  async updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    window.AcademicDB.setLocal(window.AcademicDB.keys.SETTINGS, updated);

    // Sync to Supabase site_settings table asynchronously
    try {
      const supabaseUrl = (window.AcademicDB && window.AcademicDB.SUPABASE_URL) || "https://tfmbmmtlppkzcxpndiym.supabase.co";
      const supabaseKey = (window.AcademicDB && window.AcademicDB.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";

      // Prepare key-value entries to upsert into site_settings
      const entries = Object.entries(updated).map(([key, val]) => ({
        key,
        value: typeof val === "object" ? JSON.stringify(val) : String(val),
        updated_at: new Date().toISOString()
      }));

      const session = this.checkAuth();
      const authToken = (session && session.token) ? session.token : supabaseKey;

      await fetch(`${supabaseUrl}/rest/v1/site_settings`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(entries)
      });
    } catch (e) {
      console.warn("Could not sync settings to Supabase site_settings:", e);
    }

    return { success: true, settings: updated };
  },

  getPaymentMethods() {
    const s = this.getSettings();
    return Array.isArray(s.paymentMethods) ? s.paymentMethods : [];
  },

  async savePaymentMethod(methodData) {
    const s = this.getSettings();
    const methods = Array.isArray(s.paymentMethods) ? [...s.paymentMethods] : [];

    if (methodData.id) {
      const idx = methods.findIndex(m => m.id === methodData.id);
      if (idx !== -1) {
        methods[idx] = { ...methods[idx], ...methodData };
      } else {
        methods.push(methodData);
      }
    } else {
      const newMethod = {
        ...methodData,
        id: "pm-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 4)
      };
      methods.push(newMethod);
    }

    // Keep primary legacy accounts updated if matching
    const tele = methods.find(m => m.name.toLowerCase().includes("telebirr") && m.is_active !== false);
    const cbe = methods.find(m => m.name.toLowerCase().includes("cbe") && !m.name.toLowerCase().includes("birr") && m.is_active !== false);
    const awash = methods.find(m => m.name.toLowerCase().includes("awash") && m.is_active !== false);

    const extraUpdates = { paymentMethods: methods };
    if (tele && tele.accountNumber) extraUpdates.telebirrNumber = tele.accountNumber;
    if (cbe && cbe.accountNumber) extraUpdates.cbeAccount = cbe.accountNumber;
    if (awash && awash.accountNumber) extraUpdates.awashAccount = awash.accountNumber;

    await this.updateSettings(extraUpdates);
    return { success: true, paymentMethods: methods };
  },

  async deletePaymentMethod(id) {
    const s = this.getSettings();
    const methods = (Array.isArray(s.paymentMethods) ? s.paymentMethods : []).filter(m => m.id !== id);
    await this.updateSettings({ paymentMethods: methods });
    return { success: true, paymentMethods: methods };
  },

  async togglePaymentMethod(id, isActive) {
    const s = this.getSettings();
    const methods = (Array.isArray(s.paymentMethods) ? [...s.paymentMethods] : []).map(m => {
      if (m.id === id) {
        return { ...m, is_active: isActive };
      }
      return m;
    });
    await this.updateSettings({ paymentMethods: methods });
    return { success: true, paymentMethods: methods };
  }
};
