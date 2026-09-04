import { createAdminClient } from '@/lib/supabase/server';
import { CmsStat, CmsCourse, CmsFaq, CmsSiteSettings, ContactMessage, CmsTestimonial } from '@/types';
import { siteConfig, bankDetails, faqs } from '@/lib/content';

// In-Memory Fallback Store for CMS
let localStats: CmsStat[] = [
  { id: '1', stat_key: 'modules', value: 10000, suffix: '+', label: 'Certified Courses & Modules', description: 'Curated technical, leadership, and professional tracks via Skillsoft Percipio.', sort_order: 1 },
  { id: '2', stat_key: 'programs', value: 120, suffix: '+', label: 'Job-Ready Diplomas & Certificates', description: '24-week accelerated tracks aligned with global industry competencies.', sort_order: 2 },
  { id: '3', stat_key: 'duration', value: 24, suffix: ' Wks', label: 'Self-Paced Learning Model', description: 'Structured modular learning designed for working professionals and students.', sort_order: 3 },
  { id: '4', stat_key: 'gpa', value: 90, suffix: '%+', label: 'Merit Badge & Honors Level', description: 'GPA 3.6+ earns Merit Badge; 95%+ achieves the A. Medallion of Merit.', sort_order: 4 },
];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

let localCourses: CmsCourse[] = [
  {
    id: 'c1',
    title: 'Artificial Intelligence (AI)',
    slug: 'artificial-intelligence-ai',
    duration: '24 Weeks',
    level: 'Certificate / Diploma',
    category: 'job-ready',
    status: 'Active',
    is_featured: true,
    sort_order: 1,
    clicks_count: 142,
    description: 'Master practical AI systems, neural networks, computer vision, and NLP frameworks. Designed to transition Ethiopian graduates and developers directly into high-paying AI engineering roles.',
    learning_outcomes: [
      'Build end-to-end Machine Learning and Deep Learning pipelines using PyTorch and TensorFlow',
      'Deploy Computer Vision and Natural Language Processing models into production APIs',
      'Integrate Large Language Models (LLMs) and Generative AI into enterprise business workflows',
      'Understand ethical AI principles, model evaluation metrics, and low-latency serving architecture',
    ],
  },
  {
    id: 'c2',
    title: 'Data Science and Big Data',
    slug: 'data-science-and-big-data',
    duration: '24 Weeks',
    level: 'Certificate / Diploma',
    category: 'job-ready',
    status: 'Active',
    is_featured: true,
    sort_order: 2,
    clicks_count: 118,
    description: 'Transform raw data into strategic intelligence using Python, SQL, Apache Spark, and advanced statistical modeling.',
    learning_outcomes: [
      'Perform exploratory data analysis and statistical inference on massive datasets',
      'Engineer distributed data processing jobs using SQL, Pandas, and PySpark',
      'Design interactive decision intelligence dashboards in Tableau and PowerBI',
      'Formulate hypothesis testing and predictive regression models for financial and public sector applications',
    ],
  },
  {
    id: 'c3',
    title: 'Cybersecurity and Ethical Hacking',
    slug: 'cybersecurity-and-ethical-hacking',
    duration: '24 Weeks',
    level: 'Certificate / Diploma',
    category: 'job-ready',
    status: 'Active',
    is_featured: false,
    sort_order: 3,
    clicks_count: 95,
    description: 'Defend enterprise infrastructure and master penetration testing methodologies aligned with international CEH and CompTIA standards.',
    learning_outcomes: [
      'Conduct vulnerability assessments, network penetration testing, and digital forensics',
      'Configure enterprise firewall defenses, SIEM logging, and intrusion detection systems',
      'Harden Linux and Windows servers against zero-day exploits and ransomware attacks',
      'Implement ISO/IEC 27001 compliance standards and incident response playbooks',
    ],
  },
  {
    id: 'c4',
    title: 'Cloud Computing (AWS & Azure)',
    slug: 'cloud-computing-aws-azure',
    duration: '24 Weeks',
    level: 'Certificate / Diploma',
    category: 'job-ready',
    status: 'Active',
    is_featured: false,
    sort_order: 4,
    clicks_count: 88,
    description: 'Architect scalable cloud infrastructure, container orchestration, and serverless architectures on AWS and Microsoft Azure.',
    learning_outcomes: [
      'Deploy resilient multi-region architectures with auto-scaling and load balancing',
      'Master Docker containerization and Kubernetes orchestration pipelines',
      'Implement Infrastructure as Code (IaC) using Terraform and CloudFormation',
      'Prepare for AWS Solutions Architect and Azure Administrator certification exams',
    ],
  },
  {
    id: 'c5',
    title: 'Machine Learning Engineering',
    slug: 'machine-learning-engineering',
    duration: '24 Weeks',
    level: 'Certificate / Diploma',
    category: 'job-ready',
    status: 'Active',
    is_featured: false,
    sort_order: 5,
    clicks_count: 76,
    description: 'Bridge data science and software engineering by operationalizing ML models (MLOps), CI/CD pipelines, and feature stores.',
    learning_outcomes: [
      'Implement MLOps automation with MLflow, Kubeflow, and automated retraining triggers',
      'Optimize model latency with ONNX runtime, quantization, and edge deployment',
      'Monitor model drift and dataset degradation in production systems',
      'Architect robust feature stores and scalable vector databases',
    ],
  },
  {
    id: 'c6',
    title: 'Project Management Professional',
    slug: 'project-management-professional',
    duration: '24 Weeks',
    level: 'Professional Track',
    category: 'job-ready',
    status: 'Active',
    is_featured: false,
    sort_order: 6,
    clicks_count: 64,
    description: 'Equip yourself with PMI-aligned project governance, Agile Scrum frameworks, risk mitigation, and executive reporting.',
    learning_outcomes: [
      'Lead cross-functional teams through Agile, Scrum, and Waterfall lifecycles',
      'Manage project budgets, work breakdown structures, and critical path schedules',
      'Utilize Jira, Confluence, and MS Project for enterprise workflow tracking',
      'Fulfill educational requirements for the PMP and CAPM examinations',
    ],
  },
  {
    id: 'c7',
    title: 'Product Management Essentials',
    slug: 'product-management-essentials',
    duration: '24 Weeks',
    level: 'Professional Track',
    category: 'job-ready',
    status: 'Active',
    is_featured: false,
    sort_order: 7,
    clicks_count: 49,
    description: 'Drive high-impact digital products from discovery to launch with user research, roadmapping, and growth analytics.',
    learning_outcomes: [
      'Synthesize customer discovery interviews into validated problem statements and PRDs',
      'Define North Star metrics, feature prioritization matrices (RICE), and release milestones',
      'Coordinate go-to-market launches with marketing, engineering, and sales leaders',
      'Perform cohort retention analysis and A/B experimentation',
    ],
  },
  {
    id: 'c8',
    title: 'Business & Leadership Skills',
    slug: 'business-and-leadership-skills',
    duration: '24 Weeks',
    level: 'Leadership Track',
    category: 'job-ready',
    status: 'Active',
    is_featured: false,
    sort_order: 8,
    clicks_count: 53,
    description: 'Accelerate your career with executive communication, negotiation strategies, and transformative change management.',
    learning_outcomes: [
      'Master high-stakes business negotiation and conflict resolution techniques',
      'Lead organizational change initiatives with emotional intelligence and strategic alignment',
      'Deliver persuasive presentations and executive business reviews',
      'Develop high-performing team cultures across distributed work environments',
    ],
  },
  {
    id: 'c9',
    title: 'Communication & Productivity Skills',
    slug: 'communication-and-productivity-skills',
    duration: '24 Weeks',
    level: 'Productivity Track',
    category: 'job-ready',
    status: 'Active',
    is_featured: false,
    sort_order: 9,
    clicks_count: 38,
    description: 'Elevate your daily workplace output with structured thinking, professional writing, and modern digital productivity tools.',
    learning_outcomes: [
      'Draft clear, concise executive memos, client proposals, and technical documentation',
      'Implement deep work protocols, task automation, and asynchronous communication',
      'Harness AI-assisted productivity tools for research, drafting, and analysis',
      'Facilitate efficient meetings and stakeholder consensus',
    ],
  },
  {
    id: 'c10',
    title: 'Professional IT Certifications',
    slug: 'professional-it-certifications',
    duration: '24 Weeks',
    level: 'Industry Credential',
    category: 'job-ready',
    status: 'Active',
    is_featured: false,
    sort_order: 10,
    clicks_count: 42,
    description: 'Structured preparation pathways for globally recognized credentials including Cisco CCNA, CompTIA Security+, and ITIL 4.',
    learning_outcomes: [
      'Master foundational and intermediate computer networking, routing, and switching',
      'Gain hands-on lab experience with enterprise operating systems and hardware',
      'Practice with authentic simulation exams and test-taking strategies',
      'Earn verifiable digital badges through Skillsoft Percipio',
    ],
  },
  {
    id: 'c11',
    title: 'Business Analytics & Strategy',
    slug: 'business-analytics-and-strategy',
    duration: '24 Weeks',
    level: 'Executive Track',
    category: 'job-ready',
    status: 'Active',
    is_featured: false,
    sort_order: 11,
    clicks_count: 31,
    description: 'Connect financial data, market analysis, and predictive modeling to corporate decision-making and competitive advantage.',
    learning_outcomes: [
      'Construct financial models and sensitivity analysis for capital investment decisions',
      'Perform competitive market sizing and consumer sentiment analytics',
      'Translate data findings into actionable C-suite strategic recommendations',
      'Apply Porter’s Five Forces and modern blue ocean strategic frameworks',
    ],
  },
  {
    id: 'c12',
    title: 'Digital Marketing & Transformation',
    slug: 'digital-marketing-and-transformation',
    duration: '24 Weeks',
    level: 'Digital Growth',
    category: 'job-ready',
    status: 'Active',
    is_featured: false,
    sort_order: 12,
    clicks_count: 29,
    description: 'Drive customer acquisition and brand equity through omnichannel performance marketing, SEO, and CRM automation.',
    learning_outcomes: [
      'Manage high-converting Google Ads, Meta Ads, and LinkedIn campaign budgets',
      'Optimize organic search visibility through technical SEO and content marketing',
      'Implement HubSpot and marketing automation funnels to nurture customer journeys',
      'Calculate Customer Acquisition Cost (CAC), Lifetime Value (LTV), and ROAS',
    ],
  },
  {
    id: 'c13',
    title: 'Postgraduate Diploma in Management',
    slug: 'postgraduate-diploma-in-management',
    duration: '12 Months (80+ hrs/course)',
    level: 'Postgraduate Diploma',
    category: 'pgd',
    specialization: '6 Core Courses + 2 Soft-Skill Tracks + Business Simulation Game',
    status: 'Coming Soon',
    is_featured: true,
    sort_order: 13,
    clicks_count: 184,
    description: 'An elite 12-month postgraduate diploma associated with the University in New York, designed for aspiring executives, entrepreneurs, and senior civil servants.',
    learning_outcomes: [
      'Complete 6 rigorous specialization courses spanning Financial Accounting, Corporate Strategy, Operations, and Organizational Behavior',
      'Participate in real-time interactive business simulation games competing against global cohorts',
      'Develop executive leadership presence and strategic corporate governance skills',
      'Graduate with an internationally accredited qualification from New York',
    ],
  },
  {
    id: 'c14',
    title: 'Postgraduate Diploma in Information Technology',
    slug: 'postgraduate-diploma-in-information-technology',
    duration: '12 Months (80+ hrs/course)',
    level: 'Postgraduate Diploma',
    category: 'pgd',
    specialization: 'Cybersecurity, Cloud, Machine Learning, Python, Big Data, Blockchain',
    status: 'Coming Soon',
    is_featured: true,
    sort_order: 14,
    clicks_count: 156,
    description: 'Comprehensive graduate-level IT immersion encompassing enterprise software architecture, cloud platforms, and emerging technologies.',
    learning_outcomes: [
      'Master full-stack enterprise architecture and microservices design patterns',
      'Build scalable distributed systems with modern cloud and container infrastructure',
      'Analyze enterprise data pipelines and machine learning integration',
      'Complete a comprehensive capstone industry project verified by global evaluators',
    ],
  },
  {
    id: 'c15',
    title: 'Postgraduate Diploma in Artificial Intelligence & Generative AI',
    slug: 'postgraduate-diploma-in-artificial-intelligence-generative-ai',
    duration: '12 Months (80+ hrs/course)',
    level: 'Postgraduate Diploma',
    category: 'pgd',
    specialization: 'Deep Learning, LLMs, Neural Networks, AI Strategy & Ethics',
    status: 'Coming Soon',
    is_featured: true,
    sort_order: 15,
    clicks_count: 210,
    description: 'Cutting-edge advanced qualification covering transformer architectures, fine-tuning foundation models, reinforcement learning, and enterprise AI transformation.',
    learning_outcomes: [
      'Deep-dive into transformer architectures, attention mechanisms, and diffusion models',
      'Fine-tune open-source LLMs (Llama, Mistral) with PEFT and LoRA techniques',
      'Build retrieval-augmented generation (RAG) applications using vector databases',
      'Formulate comprehensive AI transformation strategies for banking, telecom, and government',
    ],
  },
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

export async function getCmsCourseBySlug(slug: string): Promise<CmsCourse | null> {
  try {
    const admin = getAdmin();
    if (admin) {
      const { data, error } = await admin
        .from('cms_courses')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (!error && data) return data as CmsCourse;
    }
  } catch {}
  const found = localCourses.find(c => c.slug === slug || slugify(c.title) === slug);
  return found || null;
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

// ==========================================
// TESTIMONIALS / SUCCESS STORIES CRUD
// ==========================================
let localTestimonials: CmsTestimonial[] = [
  {
    id: 't-1',
    name: 'Bethlehem Tadesse',
    role: 'BSc Software Engineering, AAU',
    quote: 'Transitioned from general web programming into an AI & Machine Learning role at a leading fintech firm in Addis Ababa. The Skillsoft Percipio modules and practical labs made all the difference.',
    course_completed: 'Artificial Intelligence (AI)',
    rating: 5,
    is_featured: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 't-2',
    name: 'Dawit Haile',
    role: 'Cloud Systems Administrator',
    quote: 'The AWS & Azure curriculum was structured and rigorous. Passing the AWS Solutions Architect exam on my first attempt was a pivotal milestone for my engineering career.',
    course_completed: 'Cloud Computing (AWS & Azure)',
    rating: 5,
    is_featured: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 't-3',
    name: 'Selamawit Bekele',
    role: 'Data Analyst, Commercial Bank of Ethiopia',
    quote: 'The subsidized fees and FAYDA-based access brought global-tier education within reach. Earning the A. Medallion of Merit opened doors to enterprise analytics projects.',
    course_completed: 'Data Science and Big Data',
    rating: 5,
    is_featured: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 't-4',
    name: 'Yonas Mekonnen',
    role: 'Senior Project Coordinator, UN Agency',
    quote: 'The Project Management track aligned directly with PMI standards. It enabled our regional unit to standardize delivery across four multi-stakeholder humanitarian initiatives.',
    course_completed: 'Project Management Professional',
    rating: 5,
    is_featured: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
];

export async function getCmsTestimonials(): Promise<CmsTestimonial[]> {
  try {
    const admin = getAdmin();
    if (admin) {
      const { data, error } = await admin
        .from('cms_testimonials')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data as CmsTestimonial[];
    }
  } catch {}
  return localTestimonials;
}

export async function createCmsTestimonial(
  testimonial: Omit<CmsTestimonial, 'id' | 'created_at' | 'updated_at'>
): Promise<CmsTestimonial> {
  const newTestimonial: CmsTestimonial = {
    ...testimonial,
    id: `t-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  try {
    const admin = getAdmin();
    if (admin) {
      const { data, error } = await admin
        .from('cms_testimonials')
        .insert([newTestimonial])
        .select()
        .single();
      if (!error && data) return data as CmsTestimonial;
    }
  } catch {}
  localTestimonials.push(newTestimonial);
  return newTestimonial;
}

export async function updateCmsTestimonial(
  id: string,
  updates: Partial<CmsTestimonial>
): Promise<boolean> {
  try {
    const admin = getAdmin();
    if (admin) {
      const { error } = await admin
        .from('cms_testimonials')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (!error) return true;
    }
  } catch {}
  localTestimonials = localTestimonials.map(t => t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t);
  return true;
}

export async function deleteCmsTestimonial(id: string): Promise<boolean> {
  try {
    const admin = getAdmin();
    if (admin) {
      const { error } = await admin.from('cms_testimonials').delete().eq('id', id);
      if (!error) return true;
    }
  } catch {}
  localTestimonials = localTestimonials.filter(t => t.id !== id);
  return true;
}

