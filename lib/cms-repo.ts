import { createAdminClient } from '@/lib/supabase/server';
import { CmsStat, CmsCourse, CmsFaq, CmsSiteSettings, ContactMessage } from '@/types';
import { siteConfig, bankDetails, faqs } from '@/lib/content';

// In-Memory Fallback Store for CMS
let localStats: CmsStat[] = [
  { id: '1', stat_key: 'modules', value: 10000, suffix: '+', label: 'Certified Courses & Modules', description: 'Curated technical, leadership, and professional tracks via Skillsoft Percipio.', sort_order: 1 },
  { id: '2', stat_key: 'programs', value: 120, suffix: '+', label: 'Job-Ready Diplomas & Certificates', description: '24-week accelerated tracks aligned with global industry competencies.', sort_order: 2 },
  { id: '3', stat_key: 'duration', value: 24, suffix: ' Wks', label: 'Self-Paced Learning Model', description: 'Structured modular learning designed for working professionals and students.', sort_order: 3 },
  { id: '4', stat_key: 'gpa', value: 90, suffix: '%+', label: 'Merit Badge & Honors Level', description: 'GPA 3.6+ earns Merit Badge; 95%+ achieves the A. Medallion of Merit.', sort_order: 4 },
];

let localCourses: CmsCourse[] = [
  { id: 'c1', title: 'Artificial Intelligence (AI)', duration: '24 Weeks', level: 'Certificate / Diploma', category: 'job-ready', status: 'Active', is_featured: true, sort_order: 1, clicks_count: 142 },
  { id: 'c2', title: 'Data Science and Big Data', duration: '24 Weeks', level: 'Certificate / Diploma', category: 'job-ready', status: 'Active', is_featured: true, sort_order: 2, clicks_count: 118 },
  { id: 'c3', title: 'Cybersecurity and Ethical Hacking', duration: '24 Weeks', level: 'Certificate / Diploma', category: 'job-ready', status: 'Active', is_featured: false, sort_order: 3, clicks_count: 95 },
  { id: 'c4', title: 'Cloud Computing (AWS & Azure)', duration: '24 Weeks', level: 'Certificate / Diploma', category: 'job-ready', status: 'Active', is_featured: false, sort_order: 4, clicks_count: 88 },
  { id: 'c5', title: 'Machine Learning Engineering', duration: '24 Weeks', level: 'Certificate / Diploma', category: 'job-ready', status: 'Active', is_featured: false, sort_order: 5, clicks_count: 76 },
  { id: 'c6', title: 'Project Management Professional', duration: '24 Weeks', level: 'Professional Track', category: 'job-ready', status: 'Active', is_featured: false, sort_order: 6, clicks_count: 64 },
  { id: 'c7', title: 'Product Management Essentials', duration: '24 Weeks', level: 'Professional Track', category: 'job-ready', status: 'Active', is_featured: false, sort_order: 7, clicks_count: 49 },
  { id: 'c8', title: 'Business & Leadership Skills', duration: '24 Weeks', level: 'Leadership Track', category: 'job-ready', status: 'Active', is_featured: false, sort_order: 8, clicks_count: 53 },
  { id: 'c9', title: 'Communication & Productivity Skills', duration: '24 Weeks', level: 'Productivity Track', category: 'job-ready', status: 'Active', is_featured: false, sort_order: 9, clicks_count: 38 },
  { id: 'c10', title: 'Professional IT Certifications', duration: '24 Weeks', level: 'Industry Credential', category: 'job-ready', status: 'Active', is_featured: false, sort_order: 10, clicks_count: 42 },
  { id: 'c11', title: 'Business Analytics & Strategy', duration: '24 Weeks', level: 'Executive Track', category: 'job-ready', status: 'Active', is_featured: false, sort_order: 11, clicks_count: 31 },
  { id: 'c12', title: 'Digital Marketing & Transformation', duration: '24 Weeks', level: 'Digital Growth', category: 'job-ready', status: 'Active', is_featured: false, sort_order: 12, clicks_count: 29 },
  { id: 'c13', title: 'Postgraduate Diploma in Management', duration: '12 Months (80+ hrs/course)', level: 'Postgraduate Diploma', category: 'pgd', specialization: '6 Core Courses + 2 Soft-Skill Tracks + Business Simulation Game', status: 'Coming Soon', is_featured: true, sort_order: 13, clicks_count: 184 },
  { id: 'c14', title: 'Postgraduate Diploma in Information Technology', duration: '12 Months (80+ hrs/course)', level: 'Postgraduate Diploma', category: 'pgd', specialization: 'Cybersecurity, Cloud, Machine Learning, Python, Big Data, Blockchain', status: 'Coming Soon', is_featured: true, sort_order: 14, clicks_count: 156 },
  { id: 'c15', title: 'Postgraduate Diploma in Artificial Intelligence & Generative AI', duration: '12 Months (80+ hrs/course)', level: 'Postgraduate Diploma', category: 'pgd', specialization: 'Deep Learning, LLMs, Neural Networks, AI Strategy & Ethics', status: 'Coming Soon', is_featured: true, sort_order: 15, clicks_count: 210 },
];

let localFaqs: CmsFaq[] = faqs.map((f, idx) => ({
  id: `faq-${idx + 1}`,
  question: f.question,
  answer: f.answer,
  category: 'General',
  sort_order: idx + 1,
}));

let localSettings: CmsSiteSettings = {
  name: siteConfig.name,
  tagline: siteConfig.tagline,
  motto: siteConfig.motto,
  subheading: siteConfig.subheading,
  description: siteConfig.description,
  contactEmail: siteConfig.contactEmail,
  phone: siteConfig.phone,
  address: siteConfig.address,
  bankName: bankDetails.bankName,
  accountName: bankDetails.accountName,
  accountNumber: bankDetails.accountNumber,
  swiftCode: bankDetails.swiftCode,
  applicationFee: bankDetails.applicationFee,
  feeNumeric: 3500,
  paymentMethods: [
    {
      id: "pm-1",
      name: "Telebirr SuperApp / USSD",
      type: "mobile_money",
      accountNumber: "0911234567",
      accountName: "Academic Excellence Ethiopia",
      instructions: "Pay to Merchant/Individual Account via Telebirr or *127# and attach transaction SMS screenshot.",
      is_active: true,
    },
    {
      id: "pm-2",
      name: "Commercial Bank of Ethiopia (CBE)",
      type: "bank_account",
      accountNumber: "1000123456789",
      accountName: "Academic Excellence Admissions",
      instructions: "Transfer via CBE Mobile Banking, CBE Birr, or direct branch deposit.",
      is_active: true,
    },
    {
      id: "pm-3",
      name: "CBE Birr Wallet",
      type: "mobile_money",
      accountNumber: "0911234567",
      accountName: "Academic Excellence Ethiopia",
      instructions: "Transfer using CBE Birr mobile app or USSD *847# with applicant reference ID.",
      is_active: true,
    },
    {
      id: "pm-4",
      name: "Awash Bank",
      type: "bank_account",
      accountNumber: "01320876543210",
      accountName: "Academic Excellence Intake",
      instructions: "Transfer via Awash Birr Pro mobile banking or branch deposit.",
      is_active: true,
    },
    {
      id: "pm-5",
      name: "Bank of Abyssinia",
      type: "bank_account",
      accountNumber: "1234567890123",
      accountName: "Academic Excellence Initiative",
      instructions: "Transfer via BOA Apollo app or branch counter deposit.",
      is_active: true,
    },
  ],
};

let localMessages: ContactMessage[] = [];

function getAdmin() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

// ==========================================
// STATS CRUD
// ==========================================
export async function getCmsStats(): Promise<CmsStat[]> {
  try {
    const admin = getAdmin();
    if (admin) {
      const { data, error } = await admin.from('cms_stats').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data as CmsStat[];
    }
  } catch {}
  return localStats;
}

export async function updateCmsStat(id: string, updates: Partial<CmsStat>): Promise<boolean> {
  try {
    const admin = getAdmin();
    if (admin) {
      const { error } = await admin.from('cms_stats').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (!error) return true;
    }
  } catch {}
  localStats = localStats.map(s => s.id === id ? { ...s, ...updates } : s);
  return true;
}

// ==========================================
// COURSES CRUD
// ==========================================
export async function getCmsCourses(): Promise<CmsCourse[]> {
  try {
    const admin = getAdmin();
    if (admin) {
      const { data, error } = await admin.from('cms_courses').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data as CmsCourse[];
    }
  } catch {}
  return localCourses;
}

export async function createCmsCourse(course: Omit<CmsCourse, 'id' | 'clicks_count'>): Promise<CmsCourse> {
  const newCourse: CmsCourse = {
    ...course,
    id: `c-${Date.now()}`,
    clicks_count: 0,
  };
  try {
    const admin = getAdmin();
    if (admin) {
      const { data, error } = await admin.from('cms_courses').insert([newCourse]).select().single();
      if (!error && data) return data as CmsCourse;
    }
  } catch {}
  localCourses.push(newCourse);
  return newCourse;
}

export async function updateCmsCourse(id: string, updates: Partial<CmsCourse>): Promise<boolean> {
  try {
    const admin = getAdmin();
    if (admin) {
      const { error } = await admin.from('cms_courses').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (!error) return true;
    }
  } catch {}
  localCourses = localCourses.map(c => c.id === id ? { ...c, ...updates } : c);
  return true;
}

export async function deleteCmsCourse(id: string): Promise<boolean> {
  try {
    const admin = getAdmin();
    if (admin) {
      const { error } = await admin.from('cms_courses').delete().eq('id', id);
      if (!error) return true;
    }
  } catch {}
  localCourses = localCourses.filter(c => c.id !== id);
  return true;
}

// ==========================================
// FAQS CRUD
// ==========================================
export async function getCmsFaqs(): Promise<CmsFaq[]> {
  try {
    const admin = getAdmin();
    if (admin) {
      const { data, error } = await admin.from('cms_faqs').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data as CmsFaq[];
    }
  } catch {}
  return localFaqs;
}

export async function createCmsFaq(faq: Omit<CmsFaq, 'id'>): Promise<CmsFaq> {
  const newFaq: CmsFaq = {
    ...faq,
    id: `faq-${Date.now()}`,
  };
  try {
    const admin = getAdmin();
    if (admin) {
      const { data, error } = await admin.from('cms_faqs').insert([newFaq]).select().single();
      if (!error && data) return data as CmsFaq;
    }
  } catch {}
  localFaqs.push(newFaq);
  return newFaq;
}

export async function updateCmsFaq(id: string, updates: Partial<CmsFaq>): Promise<boolean> {
  try {
    const admin = getAdmin();
    if (admin) {
      const { error } = await admin.from('cms_faqs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (!error) return true;
    }
  } catch {}
  localFaqs = localFaqs.map(f => f.id === id ? { ...f, ...updates } : f);
  return true;
}

export async function deleteCmsFaq(id: string): Promise<boolean> {
  try {
    const admin = getAdmin();
    if (admin) {
      const { error } = await admin.from('cms_faqs').delete().eq('id', id);
      if (!error) return true;
    }
  } catch {}
  localFaqs = localFaqs.filter(f => f.id !== id);
  return true;
}

// ==========================================
// SITE SETTINGS CRUD
// ==========================================
export async function getCmsSiteSettings(): Promise<CmsSiteSettings> {
  try {
    const admin = getAdmin();
    if (admin) {
      const { data, error } = await admin.from('cms_site_settings').select('data').eq('id', 'main_config').single();
      if (!error && data?.data) return data.data as CmsSiteSettings;
    }
  } catch {}
  return localSettings;
}

export async function updateCmsSiteSettings(settings: Partial<CmsSiteSettings>): Promise<boolean> {
  localSettings = { ...localSettings, ...settings };
  try {
    const admin = getAdmin();
    if (admin) {
      const { error } = await admin.from('cms_site_settings').upsert({
        id: 'main_config',
        data: localSettings,
        updated_at: new Date().toISOString(),
      });
      if (!error) return true;
    }
  } catch {}
  return true;
}

// ==========================================
// CONTACT INQUIRIES
// ==========================================
export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const admin = getAdmin();
    if (admin) {
      const { data, error } = await admin.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as ContactMessage[];
    }
  } catch {}
  return localMessages;
}

export async function recordContactMessage(msg: { email: string; message: string }): Promise<boolean> {
  const newMsg: ContactMessage = {
    id: `msg-${Date.now()}`,
    email: msg.email,
    message: msg.message,
    created_at: new Date().toISOString(),
  };
  try {
    const admin = getAdmin();
    if (admin) {
      await admin.from('contact_messages').insert([newMsg]);
    }
  } catch {}
  localMessages.unshift(newMsg);
  return true;
}
