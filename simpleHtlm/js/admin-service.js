/**
 * Academic Excellence — Admin Dashboard Service
 * Authentication, Analytics KPIs, Applications Management, Course CRUD, and CMS Handlers
 */

window.AdminService = {
  // 1. AUTHENTICATION
  login(email, password) {
    const cleanEmail = (email || "").trim().toLowerCase();
    // Default admin credentials (matches Next.js admin configuration)
    if ((cleanEmail === "admin@academice.edu.et" || cleanEmail === "admin") && (password === "Admin@2026!" || password === "admin123")) {
      const session = {
        token: "ae_token_" + Date.now(),
        email: cleanEmail,
        role: "Super Admin",
        loginTime: new Date().toISOString()
      };
      sessionStorage.setItem(window.AcademicDB.keys.ADMIN_AUTH, JSON.stringify(session));
      return { success: true };
    }
    return { success: false, error: "Invalid admin credentials. Please check your email and password." };
  },

  checkAuth() {
    try {
      const raw = sessionStorage.getItem(window.AcademicDB.keys.ADMIN_AUTH);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  logout() {
    sessionStorage.removeItem(window.AcademicDB.keys.ADMIN_AUTH);
    window.location.href = "login.html";
  },

  requireAuth() {
    if (!this.checkAuth()) {
      window.location.href = "login.html";
    }
  },

  // 2. ANALYTICS & METRICS
  getMetrics() {
    const apps = window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
    const settings = window.AcademicDB.getLocal(window.AcademicDB.keys.SETTINGS, { applicationFeeAmount: 1500 });
    const fee = settings.applicationFeeAmount || 1500;

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

    // Breakdown by course
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

  // 3. APPLICATIONS MANAGEMENT
  getApplications(filterStatus = "all", filterCourse = "all", searchQuery = "") {
    let list = window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);

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
    return list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  },

  getApplicationById(id) {
    const apps = window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
    return apps.find(a => a.id.toLowerCase() === id.toLowerCase().trim()) || null;
  },

  updateApplicationStatus(id, newStatus, internalNotes = "") {
    const apps = window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
    const idx = apps.findIndex(a => a.id.toLowerCase() === id.toLowerCase().trim());
    if (idx === -1) return { success: false, error: "Application not found" };

    const app = apps[idx];
    const prevStatus = app.status;
    app.status = newStatus;
    app.internalNotes = internalNotes;
    app.updated_at = new Date().toISOString();

    if (!app.events) app.events = [];
    app.events.push({
      type: "status_changed",
      title: `Status Changed: ${newStatus.toUpperCase().replace("_", " ")}`,
      time: new Date().toISOString(),
      note: `Application transitioned from ${prevStatus} to ${newStatus}. ${internalNotes ? "Admin Note: " + internalNotes : ""}`
    });

    apps[idx] = app;
    window.AcademicDB.setLocal(window.AcademicDB.keys.APPLICATIONS, apps);

    // Live update Supabase if available
    if (window.AcademicDB.supabase) {
      try {
        window.AcademicDB.supabase
          .from("applications")
          .update({ status: newStatus, internal_notes: internalNotes, updated_at: app.updated_at })
          .eq("id", id);
      } catch (e) {}
    }

    return { success: true, application: app };
  },

  exportApplicationsToCSV() {
    const apps = window.AcademicDB.getLocal(window.AcademicDB.keys.APPLICATIONS, []);
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

  // 5. SETTINGS
  getSettings() {
    return window.AcademicDB.getLocal(window.AcademicDB.keys.SETTINGS, {});
  },

  updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    window.AcademicDB.setLocal(window.AcademicDB.keys.SETTINGS, updated);
    return { success: true, settings: updated };
  }
};
