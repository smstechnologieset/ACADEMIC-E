/**
 * Academic Excellence — Supabase & Data Persistence Client
 * Connects directly to Supabase with resilient LocalStorage fallback
 */

const SUPABASE_URL = "https://ujljnfhmzlnegzokneia.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbGpuZmhtemxuZWd6b2tuZWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjgyMjQsImV4cCI6MjEwMzc0NDIyNH0.B51eHxdWIjoOaF8Lmxpf0St0IWo4b2ZIK2HmxP-76yU";

// Dynamic Supabase Client Initializer
function getSupabaseInstance() {
  if (typeof window !== "undefined" && !window.supabaseInstance && window.supabase && window.supabase.createClient) {
    try {
      window.supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (err) {
      console.warn("Supabase init error:", err);
    }
  }
  return window.supabaseInstance || null;
}
getSupabaseInstance();

// LocalStorage Persistence Layer
const StorageKeys = {
  APPLICATIONS: "ae_db_applications",
  COURSES: "ae_db_courses",
  FAQS: "ae_db_faqs",
  TESTIMONIALS: "ae_db_testimonials",
  SETTINGS: "ae_db_settings",
  INQUIRIES: "ae_db_inquiries",
  ADMIN_AUTH: "ae_admin_session",
  DRAFT_APP: "ae_draft_application",
  PENDING_REF: "ae_pending_payment_ref"
};

// Initial Seed Settings
const defaultSettings = {
  applicationFee: "1,500 ETB / $35 USD",
  applicationFeeAmount: 1500,
  telebirrNumber: "0911 55 2345",
  cbeAccount: "1000 3948 29384",
  awashAccount: "0132 0876 5432 10",
  currency: "ETB",
  contactEmail: "admissions@academice.edu.et",
  partnershipsEmail: "partnerships@academice.edu.et",
  phone: "+251 11 555 2345",
  address: "Bole Sub-City, Education Hub, Addis Ababa, Ethiopia",
  paymentMethods: [
    {
      id: "pm-telebirr",
      name: "Telebirr SuperApp / USSD",
      accountNumber: "0911 55 2345",
      accountName: "Academic Excellence Ethiopia",
      instructions: "Transfer to merchant/individual phone number via Telebirr or dial *127#.",
      badge: "Fastest / Instant",
      is_active: true
    },
    {
      id: "pm-cbe",
      name: "Commercial Bank of Ethiopia (CBE)",
      accountNumber: "1000 3948 29384",
      accountName: "Academic Excellence Education Initiative",
      instructions: "Transfer via CBE Mobile Banking, CBE Birr, or direct counter deposit.",
      badge: "Standard Bank",
      is_active: true
    },
    {
      id: "pm-cbebirr",
      name: "CBE Birr Wallet",
      accountNumber: "0911 55 2345",
      accountName: "Academic Excellence Education Initiative",
      instructions: "Transfer via CBE Birr mobile app or USSD *847# with your Reference ID.",
      badge: "Mobile Wallet",
      is_active: true
    },
    {
      id: "pm-awash",
      name: "Awash Bank",
      accountNumber: "0132 0876 5432 10",
      accountName: "Academic Excellence Intake",
      instructions: "Transfer via Awash Birr Pro or at any local Awash Bank branch.",
      badge: "Bank Transfer",
      is_active: true
    }
  ]
};

// Initial Seed Seed Applications for Demo & Testing
const defaultApplications = [
  {
    id: "AE-2026-7014",
    firstName: "Dawit",
    middleName: "Haile",
    lastName: "Tadesse",
    fullName: "Dawit Haile Tadesse",
    age: 26,
    phone: "+251 91 123 4567",
    email: "dawit.tadesse@aau.edu.et",
    fullAddress: "House 412, Woreda 03, Bole Sub-City, Addis Ababa, Ethiopia",
    place: "Addis Ababa",
    qualification: "Bachelor's Degree (BA / BSc)",
    previousInstitution: "Addis Ababa University",
    fieldOfStudy: "Computer Science",
    courseApplied: "Artificial Intelligence (AI)",
    faydaIdNumber: "FIN-ET-8923-0192",
    faydaFileName: "Official_Fayda_National_ID.pdf",
    faydaFileUrl: "assets/students.jpg",
    educationDocName: "AAU_BSc_Degree_Certificate.pdf",
    educationDocUrl: "assets/campus.jpg",
    signature: "Dawit H. Tadesse",
    status: "approved",
    paymentMethod: "Commercial Bank of Ethiopia (CBE)",
    paymentRef: "CBE-TX-9840293",
    paymentSlipName: "CBE_Deposit_Slip_7014.jpg",
    paymentSlipUrl: "assets/campus.jpg",
    internalNotes: "FAYDA digital ID and AAU BSc degree verified. Admitted with NY University accreditation badge.",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    events: [
      { type: "submitted", title: "Application Submitted", time: new Date(Date.now() - 3600000 * 48).toISOString(), note: "Application registered online." },
      { type: "payment_uploaded", title: "Payment Proof Received", time: new Date(Date.now() - 3600000 * 36).toISOString(), note: "CBE transfer slip attached." },
      { type: "under_review", title: "Admissions Verification", time: new Date(Date.now() - 3600000 * 24).toISOString(), note: "Fayda ID and degree certificates verified." },
      { type: "status_changed", title: "Application Approved", time: new Date(Date.now() - 3600000 * 12).toISOString(), note: "Candidate officially accepted into AI program." }
    ]
  },
  {
    id: "AE-2026-7029",
    firstName: "Selamawit",
    middleName: "Girma",
    lastName: "Bekele",
    fullName: "Selamawit Girma Bekele",
    age: 24,
    phone: "+251 92 345 6789",
    email: "selamawit.bekele@outlook.com",
    fullAddress: "Zone 2, Kebele 08, Hawassa, Sidama Region, Ethiopia",
    place: "Hawassa",
    qualification: "Associate Degree / College Diploma",
    previousInstitution: "Hawassa Polytechnic College",
    fieldOfStudy: "Information Technology",
    courseApplied: "Data Science and Big Data",
    faydaIdNumber: "FIN-ET-4412-8871",
    faydaFileName: "Fayda_Digital_Scan.png",
    faydaFileUrl: "assets/students.jpg",
    educationDocName: "Hawassa_Polytechnic_Transcript.pdf",
    educationDocUrl: "assets/campus.jpg",
    signature: "Selamawit G.",
    status: "under_review",
    paymentMethod: "Telebirr SuperApp / USSD",
    paymentRef: "TB-0928374-ET",
    paymentSlipName: "Telebirr_Screenshot_Proof.png",
    paymentSlipUrl: "assets/campus.jpg",
    internalNotes: "Payment received via Telebirr. Academic transcripts undergoing qualification check.",
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    events: [
      { type: "submitted", title: "Application Submitted", time: new Date(Date.now() - 3600000 * 20).toISOString(), note: "Application registered." },
      { type: "payment_uploaded", title: "Payment Proof Received", time: new Date(Date.now() - 3600000 * 18).toISOString(), note: "Telebirr confirmation uploaded." },
      { type: "under_review", title: "Under Review", time: new Date(Date.now() - 3600000 * 6).toISOString(), note: "Admissions officer reviewing transcripts." }
    ]
  },
  {
    id: "AE-2026-7035",
    firstName: "Yohannes",
    middleName: "Kassaye",
    lastName: "Moges",
    fullName: "Yohannes Kassaye Moges",
    age: 31,
    phone: "+251 91 876 5432",
    email: "yohannes.kassaye@telecom.et",
    fullAddress: "Sub-City Kirkos, Woreda 02, Addis Ababa, Ethiopia",
    place: "Addis Ababa",
    qualification: "Master's Degree (MA / MSc / MBA)",
    previousInstitution: "HilCoE School of Computer Science",
    fieldOfStudy: "Software Engineering",
    courseApplied: "Cloud Computing (AWS & Azure)",
    faydaIdNumber: "FIN-ET-3029-4412",
    faydaFileName: "Fayda_ID_Yohannes.pdf",
    faydaFileUrl: "assets/students.jpg",
    educationDocName: "MSc_Software_Eng_Degree.pdf",
    educationDocUrl: "assets/campus.jpg",
    signature: "Yohannes K. Moges",
    status: "pending",
    paymentMethod: "",
    paymentRef: "",
    paymentSlipName: "",
    paymentSlipUrl: "",
    internalNotes: "Awaiting bank deposit slip.",
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    events: [
      { type: "submitted", title: "Application Submitted", time: new Date(Date.now() - 3600000 * 8).toISOString(), note: "Application created. Pending payment confirmation." }
    ]
  }
];

// Helper to get or initialize stored data
function getLocalData(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch (e) {
    return defaultVal;
  }
}

function setLocalData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage write error:", e);
  }
}

// Initialize default storage collections if empty
if (typeof window !== "undefined") {
  getLocalData(StorageKeys.APPLICATIONS, defaultApplications);
  getLocalData(StorageKeys.SETTINGS, defaultSettings);
}

// Global DB Gateway API
window.AcademicDB = {
  get supabase() {
    return getSupabaseInstance();
  },
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  keys: StorageKeys,
  getLocal: getLocalData,
  setLocal: setLocalData,
  
  // Format utility
  formatCurrency(amount) {
    return `${Number(amount).toLocaleString()} ETB`;
  },
  formatDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return iso;
    }
  }
};
