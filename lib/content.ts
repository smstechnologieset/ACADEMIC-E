/**
 * =========================================================================
 * ACADEMIC EXCELLENCE — ETHIOPIA INTAKE PLATFORM
 * Central content and client configuration based on client questionnaire response
 * =========================================================================
 */

export const siteConfig = {
  name: "Academic Excellence",
  shortName: "Academic E",
  tagline: "The Pathway to Success",
  motto: "Empowering People. Expanding Opportunity. Transforming Futures.",
  subheading: "Transforming Lives Through Global Education, Skills Development, and Workforce Readiness",
  description:
    "A transformative educational initiative established to expand equitable access to internationally recognized education, workforce development, and career advancement opportunities for Ethiopian learners.",
  url: "https://academice.edu.et",
  contactEmail: "admissions@academice.edu.et",
  phone: "+251 11 555 2345",
  address: "Bole Sub-City, Education Hub, Addis Ababa, Ethiopia",
  hours: "Monday - Friday: 8:30 AM - 5:30 PM EAT",
  partnersSummary:
    "Implemented in collaboration with N, RI, and University in New York (part of one of the largest public university systems in the United States) and delivered via the Skillsoft Percipio learning platform.",
};

export const bankDetails = {
  bankName: "Commercial Bank of Ethiopia (CBE) / Awash Bank",
  accountName: "Academic Excellence Education Initiative",
  accountNumber: "1000 3948 29384",
  routingNumber: "CBEETAA",
  swiftCode: "CBETETAA",
  applicationFee: "15,000 ETB",
  referenceNotePrompt: "Please enter your Application Reference Number in the deposit / transfer reason field.",
};

export const statCounters = [
  {
    label: "Specialized Courses",
    value: 10000,
    suffix: "+",
    description: "Industry-aligned courses across high-demand disciplines",
  },
  {
    label: "Diploma & Cert Programs",
    value: 120,
    suffix: "+",
    description: "Programs associated with University in New York",
  },
  {
    label: "Completion Window",
    value: 24,
    suffix: " wks",
    description: "Flexible, self-paced learning for students & professionals",
  },
  {
    label: "High Achiever GPA",
    value: 3.6,
    suffix: "+",
    description: "Eligible for prestigious Merit Badge & A. Medallion of Merit",
  },
];

export const focusPillars = [
  "Professional Skill Development",
  "Reskilling and Upskilling Initiatives",
  "Industry-Relevant Certifications",
  "Productivity Enhancement Programs",
  "Leadership and Career Advancement Training",
];

export const courseCategories = [
  {
    category: "Job-Ready Global Learning Programs",
    description: "Structured pathways drawing from nearly 10,000 learning resources delivered via Skillsoft Percipio.",
    courses: [
      "Artificial Intelligence (AI)",
      "Data Science and Big Data",
      "Cybersecurity and Ethical Hacking",
      "Cloud Computing (AWS & Azure)",
      "Machine Learning",
      "Project Management",
      "Product Management",
      "Business and Leadership Skills",
      "Communication and Productivity Skills",
      "Professional IT Certifications",
      "Business Analytics & Strategy",
      "Digital Marketing & Transformation",
    ],
  },
  {
    category: "Postgraduate Diploma (PGD) Programs (Coming Soon)",
    description: "12-month advanced diplomas featuring 6 specialization courses, 2 soft-skill courses, and business simulation games.",
    courses: [
      "Postgraduate Diploma in Management",
      "Postgraduate Diploma in Information Technology",
      "Postgraduate Diploma in Artificial Intelligence & Generative AI (AI/GAI)",
    ],
  },
];

// Flat list for application select box
export const availableCourses = [
  "Job-Ready: Artificial Intelligence (AI)",
  "Job-Ready: Data Science and Big Data",
  "Job-Ready: Cybersecurity and Ethical Hacking",
  "Job-Ready: Cloud Computing",
  "Job-Ready: Machine Learning",
  "Job-Ready: Project Management",
  "Job-Ready: Product Management",
  "Job-Ready: Business and Leadership Skills",
  "Job-Ready: Communication and Productivity Skills",
  "Job-Ready: Professional Certifications",
  "PGD: Postgraduate Diploma in Management (Coming Soon)",
  "PGD: Postgraduate Diploma in Information Technology (Coming Soon)",
  "PGD: Postgraduate Diploma in AI & Generative AI (Coming Soon)",
];

export const qualificationOptions = [
  "High School Diploma / Grade 12 Completion",
  "TVET / Vocational Level IV / V Certificate",
  "Associate Degree / College Diploma",
  "Bachelor's Degree (BA / BSc)",
  "Master's Degree (MA / MSc / MBA)",
  "Doctorate / PhD",
  "Other Professional Qualification",
];

export const processSteps = [
  {
    step: "01",
    title: "Personal Profile",
    description: "Submit legal name, age, full address, qualification, and select your course.",
  },
  {
    step: "02",
    title: "Upload FAYDA ID",
    description: "Attach official Ethiopian National ID (FAYDA) or passport image/PDF.",
  },
  {
    step: "03",
    title: "Sign & Verify",
    description: "Provide applicant signature, declaration place, date, and security captcha.",
  },
  {
    step: "04",
    title: "Subsidized Fee",
    description: "Follow the subsidized course payment instructions and upload payment slip.",
  },
  {
    step: "05",
    title: "Admissions & Onboarding",
    description: "Receive enrollment confirmation and Skillsoft Percipio platform credentials.",
  },
];

export const faqs = [
  {
    question: "What is Academic Excellence and who are the partners?",
    answer:
      "Academic Excellence is an educational initiative established to expand equitable access to internationally recognized education for Ethiopian learners. We operate in strategic partnership with N, RI, and the University in New York (part of one of the largest public university systems in the US), with course delivery powered by Skillsoft Percipio.",
  },
  {
    question: "What is FAYDA ID and why is it required for application?",
    answer:
      "The FAYDA ID is Ethiopia's official National Digital Identification. It allows our admissions and verification board to certify applicant identity and grant subsidized tuition access reserved for Ethiopian learners and professionals.",
  },
  {
    question: "What credentials do learners receive upon course completion?",
    answer:
      "Graduates receive globally recognized certifications associated with the University in New York, USA. In addition, students achieving a GPA of 3.6 or higher (90%+) earn a Merit Badge, and top scores of 95%+ are awarded the prestigious A. Medallion of Merit.",
  },
  {
    question: "How long do the Job-Ready and Postgraduate Diploma programs take?",
    answer:
      "Most Job-Ready Diploma & Certificate programs can be completed flexibly within 24 weeks. The Postgraduate Diploma (PGD) programs are comprehensive 12-month online tracks encompassing 80+ hours per specialization course plus soft skills and business simulations.",
  },
  {
    question: "Are the courses accessible to working professionals in Ethiopia?",
    answer:
      "Yes! All courses are delivered 100% online through the Skillsoft Percipio digital platform with flexible schedules, interactive webinars, and mobile accessibility designed specifically for university students, working professionals, civil servants, and entrepreneurs.",
  },
];
