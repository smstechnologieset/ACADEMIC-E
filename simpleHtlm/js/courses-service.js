/**
 * Academic Excellence — Courses Data & Catalog Service
 * Course list matches client-approved content exactly.
 */

const defaultCourses = [
  // ── JOB-READY 24-WEEK PROGRAMS ──────────────────────────────────
  {
    id: "course-ai",
    title: "Artificial Intelligence (AI)",
    slug: "artificial-intelligence",
    category: "job-ready",
    categoryLabel: "Job-Ready (24 Weeks)",
    duration: "24 Weeks",
    level: "Accredited Certificate / Diploma",
    isFeatured: true,
    description: "Master core neural networks, deep learning, LLMs, and generative AI. Certified in collaboration with University in New York and delivered via the Skillsoft Percipio platform.",
    highlights: [
      "Core Neural Networks, Deep Learning & LLMs",
      "Python, TensorFlow & PyTorch Lab Exercises",
      "Ethics, Governance & Generative AI Integration",
      "Real-world capstone portfolio for global employment"
    ],
    syllabus: [
      { module: "Module 1: Foundations of Artificial Intelligence & Python Computing", weeks: "Weeks 1-4" },
      { module: "Module 2: Supervised & Unsupervised Machine Learning Algorithms", weeks: "Weeks 5-10" },
      { module: "Module 3: Deep Learning, CNNs & Natural Language Processing", weeks: "Weeks 11-16" },
      { module: "Module 4: Enterprise Generative AI, APIs & Capstone Project", weeks: "Weeks 17-24" }
    ],
    prerequisites: "Basic programming familiarity or mathematical aptitude; Bachelor's, Diploma, or relevant analytical background recommended.",
    tuitionFee: "Subsidized Intake (Application Fee applies)"
  },
  {
    id: "course-data-science",
    title: "Data Science and Big Data",
    slug: "data-science-and-big-data",
    category: "job-ready",
    categoryLabel: "Job-Ready (24 Weeks)",
    duration: "24 Weeks",
    level: "Accredited Certificate / Diploma",
    isFeatured: true,
    description: "Transform complex data into strategic business intelligence using modern statistical computing, SQL pipelines, and cloud analytics.",
    highlights: [
      "Exploratory Data Analysis with Pandas & NumPy",
      "Relational & NoSQL Big Data Pipelines",
      "Interactive Dashboards (Tableau & PowerBI)",
      "Predictive Modeling & Statistical Forecasting"
    ],
    syllabus: [
      { module: "Module 1: Advanced SQL, Data Wrangling & Python Analytics", weeks: "Weeks 1-6" },
      { module: "Module 2: Statistical Modeling & Exploratory Analysis", weeks: "Weeks 7-12" },
      { module: "Module 3: Big Data Architecture (Spark, Hadoop & Cloud Storage)", weeks: "Weeks 13-18" },
      { module: "Module 4: Enterprise BI Dashboards & Capstone Project", weeks: "Weeks 19-24" }
    ],
    prerequisites: "Interest in quantitative methods, business metrics, or software tooling.",
    tuitionFee: "Subsidized Intake (Application Fee applies)"
  },
  {
    id: "course-cybersecurity",
    title: "Cybersecurity and Ethical Hacking",
    slug: "cybersecurity-and-ethical-hacking",
    category: "job-ready",
    categoryLabel: "Job-Ready (24 Weeks)",
    duration: "24 Weeks",
    level: "Accredited Certificate / Diploma",
    isFeatured: true,
    description: "Protect enterprise digital assets through zero-trust defense architectures, penetration testing, threat detection, and incident response.",
    highlights: [
      "Network Vulnerability Assessment & Penetration Labs",
      "Zero-Trust Architecture & Cryptography",
      "SOC Analysis, Threat Hunting & SIEM Monitoring",
      "International Security Compliance & Standards"
    ],
    syllabus: [
      { module: "Module 1: Network Protocols, Defensive Security & Firewalls", weeks: "Weeks 1-6" },
      { module: "Module 2: Vulnerability Analysis & Ethical Penetration Testing", weeks: "Weeks 7-12" },
      { module: "Module 3: Incident Response, Forensics & Cloud Security", weeks: "Weeks 13-18" },
      { module: "Module 4: Security Operations Center (SOC) Simulation", weeks: "Weeks 19-24" }
    ],
    prerequisites: "Basic understanding of operating systems, computing hardware, or networking.",
    tuitionFee: "Subsidized Intake (Application Fee applies)"
  },
  {
    id: "course-cloud",
    title: "Cloud Computing",
    slug: "cloud-computing",
    category: "job-ready",
    categoryLabel: "Job-Ready (24 Weeks)",
    duration: "24 Weeks",
    level: "Accredited Certificate / Diploma",
    isFeatured: true,
    description: "Design resilient, scalable cloud architectures across AWS and Microsoft Azure with DevOps automation and containerization.",
    highlights: [
      "Multi-Cloud Architecture (AWS & Microsoft Azure)",
      "Docker Containers, Kubernetes & CI/CD Pipelines",
      "Serverless Architecture & Infrastructure as Code (Terraform)",
      "Cloud Cost Optimization & High Availability"
    ],
    syllabus: [
      { module: "Module 1: Cloud Principles, Virtualization & Compute Storage", weeks: "Weeks 1-5" },
      { module: "Module 2: AWS Solutions Architecture & IAM Security", weeks: "Weeks 6-11" },
      { module: "Module 3: Microsoft Azure Administration & Hybrid Deployments", weeks: "Weeks 12-17" },
      { module: "Module 4: DevOps Automation, Kubernetes & Live Migration", weeks: "Weeks 18-24" }
    ],
    prerequisites: "Familiarity with IT systems, computer networking, or web development.",
    tuitionFee: "Subsidized Intake (Application Fee applies)"
  },
  {
    id: "course-machine-learning",
    title: "Machine Learning",
    slug: "machine-learning",
    category: "job-ready",
    categoryLabel: "Job-Ready (24 Weeks)",
    duration: "24 Weeks",
    level: "Accredited Certificate / Diploma",
    isFeatured: false,
    description: "Bridge research algorithms with robust production pipelines using MLOps, automated training, model monitoring, and scalable inference.",
    highlights: [
      "Production Model Deployment & Monitoring",
      "Feature Stores, Data Validation & CI/CD for ML",
      "Dockerized ML Microservices on Cloud",
      "End-to-End Real-Time Predictive Engines"
    ],
    syllabus: [
      { module: "Module 1: Advanced ML Mathematics & Model Optimization", weeks: "Weeks 1-6" },
      { module: "Module 2: MLOps, Model Versioning & MLflow Pipelines", weeks: "Weeks 7-12" },
      { module: "Module 3: Scalable Inference, FastAPI & Kubernetes", weeks: "Weeks 13-18" },
      { module: "Module 4: Production Capstone with Live Monitoring", weeks: "Weeks 19-24" }
    ],
    prerequisites: "Prior programming experience in Python.",
    tuitionFee: "Subsidized Intake (Application Fee applies)"
  },
  {
    id: "course-project-management",
    title: "Project Management",
    slug: "project-management",
    category: "job-ready",
    categoryLabel: "Job-Ready (24 Weeks)",
    duration: "24 Weeks",
    level: "Accredited Certificate",
    isFeatured: false,
    description: "Align enterprise goals with disciplined delivery across Agile, Scrum, Kanban, and traditional waterfall project management frameworks.",
    highlights: [
      "Agile & Scrum Master Leadership Certifications",
      "Risk Management, Budgeting & Resource Allocation",
      "Jira, Confluence & Modern Enterprise Workflows",
      "Cross-functional Stakeholder Communication"
    ],
    syllabus: [
      { module: "Module 1: Project Initiation, Scope Definition & Charters", weeks: "Weeks 1-6" },
      { module: "Module 2: Agile Frameworks, Sprints & Team Velocity", weeks: "Weeks 7-12" },
      { module: "Module 3: Enterprise Risk, Procurement & Budgeting", weeks: "Weeks 13-18" },
      { module: "Module 4: Complex Delivery Simulation & Capstone", weeks: "Weeks 19-24" }
    ],
    prerequisites: "Open to graduates and aspiring managers in all disciplines.",
    tuitionFee: "Subsidized Intake (Application Fee applies)"
  },
  {
    id: "course-product-management",
    title: "Product Management",
    slug: "product-management",
    category: "job-ready",
    categoryLabel: "Job-Ready (24 Weeks)",
    duration: "24 Weeks",
    level: "Accredited Certificate",
    isFeatured: false,
    description: "Guide products from user research and MVP to market launch, growth loops, and data-driven iteration.",
    highlights: [
      "User Discovery, Wireframing & Prototyping",
      "Product Strategy, Roadmapping & Prioritization",
      "Metrics (CAC, LTV, Retention, Product-Market Fit)",
      "Go-to-Market Strategy & Cross-Team Orchestration"
    ],
    syllabus: [
      { module: "Module 1: Market Research, Customer Discovery & Problem Definition", weeks: "Weeks 1-6" },
      { module: "Module 2: Product Roadmaps, PRDs & Agile Sprints", weeks: "Weeks 7-12" },
      { module: "Module 3: Analytics, A/B Testing & Unit Economics", weeks: "Weeks 13-18" },
      { module: "Module 4: Complete Product Launch Simulation", weeks: "Weeks 19-24" }
    ],
    prerequisites: "Strong communication skills and passion for technology products.",
    tuitionFee: "Subsidized Intake (Application Fee applies)"
  },
  {
    id: "course-business-leadership",
    title: "Business and Leadership Skills",
    slug: "business-and-leadership-skills",
    category: "job-ready",
    categoryLabel: "Job-Ready (24 Weeks)",
    duration: "24 Weeks",
    level: "Accredited Certificate / Diploma",
    isFeatured: false,
    description: "Develop executive decision-making, strategic thinking, cross-cultural team management, financial fundamentals, and digital transformation leadership skills.",
    highlights: [
      "Executive Decision Making & Strategic Planning",
      "Cross-Cultural Team Management",
      "Financial Fundamentals & Budget Management",
      "Digital Transformation Strategy & Change Management"
    ],
    syllabus: [
      { module: "Module 1: Leadership Fundamentals & Organizational Behavior", weeks: "Weeks 1-6" },
      { module: "Module 2: Strategic Management & Business Analytics", weeks: "Weeks 7-12" },
      { module: "Module 3: Financial Acumen & Operations Management", weeks: "Weeks 13-18" },
      { module: "Module 4: Digital Leadership & Executive Capstone", weeks: "Weeks 19-24" }
    ],
    prerequisites: "Undergraduate degree or relevant professional experience.",
    tuitionFee: "Subsidized Intake (Application Fee applies)"
  },
  {
    id: "course-communication-productivity",
    title: "Communication and Productivity Skills",
    slug: "communication-and-productivity-skills",
    category: "job-ready",
    categoryLabel: "Job-Ready (24 Weeks)",
    duration: "24 Weeks",
    level: "Accredited Certificate",
    isFeatured: false,
    description: "Master professional communication, workplace productivity tools, collaboration platforms, and the interpersonal skills demanded by modern employers.",
    highlights: [
      "Professional Writing & Presentation Skills",
      "Microsoft 365, Google Workspace & Collaboration Tools",
      "Critical Thinking & Problem Solving",
      "Time Management & Personal Effectiveness"
    ],
    syllabus: [
      { module: "Module 1: Professional Communication & Business Writing", weeks: "Weeks 1-6" },
      { module: "Module 2: Productivity Tools & Digital Collaboration", weeks: "Weeks 7-12" },
      { module: "Module 3: Critical Thinking, Negotiation & Influence", weeks: "Weeks 13-18" },
      { module: "Module 4: Personal Effectiveness & Career Development", weeks: "Weeks 19-24" }
    ],
    prerequisites: "Open to all applicants; no prior technical knowledge required.",
    tuitionFee: "Subsidized Intake (Application Fee applies)"
  },
  {
    id: "course-professional-certifications",
    title: "Professional Certifications",
    slug: "professional-certifications",
    category: "job-ready",
    categoryLabel: "Job-Ready (24 Weeks)",
    duration: "24 Weeks",
    level: "Accredited Certificate",
    isFeatured: false,
    description: "Prepare for globally recognized professional certification exams across IT, project management, and business domains with structured exam-ready curricula.",
    highlights: [
      "PMP, CompTIA, AWS & Microsoft Certification Prep",
      "Practice Exams & Exam Strategy Coaching",
      "Industry-Aligned Study Materials",
      "Skillsoft Percipio Certification Pathways"
    ],
    syllabus: [
      { module: "Module 1: Certification Landscape & Exam Preparation Foundations", weeks: "Weeks 1-6" },
      { module: "Module 2: Domain-Specific Technical Deep Dives", weeks: "Weeks 7-14" },
      { module: "Module 3: Practice Exams, Mock Tests & Gap Analysis", weeks: "Weeks 15-20" },
      { module: "Module 4: Final Revision & Exam Simulation", weeks: "Weeks 21-24" }
    ],
    prerequisites: "Relevant experience in the chosen certification domain preferred.",
    tuitionFee: "Subsidized Intake (Application Fee applies)"
  },

  // ── POSTGRADUATE DIPLOMAS (PGD) — COMING SOON ──────────────────
  {
    id: "course-pgd-management",
    title: "Postgraduate Diploma in Management",
    slug: "pgd-management",
    category: "pgd",
    categoryLabel: "Postgraduate Diploma (PGD)",
    duration: "12 Months",
    level: "Postgraduate Diploma (PGD)",
    isFeatured: true,
    description: "Advanced postgraduate qualification covering Project Management, Human Resource Management, Marketing, Digital Marketing, Business Analytics, Strategy & Innovation, Leadership, Entrepreneurship, Financial Management, and Digital Transformation. Includes 2 professional soft-skill courses and access to Business Simulation Game.",
    highlights: [
      "Six specialization courses from 14+ available areas",
      "Two professional soft-skill courses",
      "80+ hours of learning per specialization course",
      "Business Simulation Game: My Business – My Strategies"
    ],
    syllabus: [
      { module: "Term 1: Strategic Management & Executive Decision Frameworks", weeks: "Months 1-3" },
      { module: "Term 2: Managerial Finance & Global Market Economics", weeks: "Months 4-6" },
      { module: "Term 3: Operations, Technology Disruption & Agile Leadership", weeks: "Months 7-9" },
      { module: "Term 4: Global Business Simulation & Applied Management Thesis", weeks: "Months 10-12" }
    ],
    prerequisites: "Bachelor's degree in any discipline with professional work experience.",
    tuitionFee: "Special PGD Enrollment"
  },
  {
    id: "course-pgd-it",
    title: "Postgraduate Diploma in Information Technology",
    slug: "pgd-information-technology",
    category: "pgd",
    categoryLabel: "Postgraduate Diploma (PGD)",
    duration: "12 Months",
    level: "Postgraduate Diploma (PGD)",
    isFeatured: false,
    description: "Advanced postgraduate IT qualification covering Cybersecurity, AI, Machine Learning, Data Science, Cloud Computing, Ethical Hacking, Python, Big Data, Blockchain, AWS, Azure, IoT, and Networking. Includes 2 professional soft-skill courses.",
    highlights: [
      "Six specialization courses from 14+ available areas",
      "Two professional soft-skill courses",
      "80+ hours of learning per specialization course",
      "Business Simulation Game: My Business – My Strategies"
    ],
    syllabus: [
      { module: "Term 1: Enterprise Information Systems & Database Architecture", weeks: "Months 1-3" },
      { module: "Term 2: Advanced Network Engineering & Cloud Virtualization", weeks: "Months 4-6" },
      { module: "Term 3: Enterprise IT Governance (ITIL, COBIT & ISO)", weeks: "Months 7-9" },
      { module: "Term 4: Strategic Technology Leadership Capstone", weeks: "Months 10-12" }
    ],
    prerequisites: "Bachelor's degree in IT, Engineering, Sciences, or related field.",
    tuitionFee: "Special PGD Enrollment"
  },
  {
    id: "course-pgd-ai-gai",
    title: "Postgraduate Diploma in Artificial Intelligence & Generative AI (AI/GAI)",
    slug: "pgd-artificial-intelligence-generative-ai",
    category: "pgd",
    categoryLabel: "Postgraduate Diploma (PGD)",
    duration: "12 Months",
    level: "Postgraduate Diploma (PGD)",
    isFeatured: true,
    description: "Intensive 12-month postgraduate qualification featuring 6 specialization courses in AI, Machine Learning, Generative AI, and enterprise AI strategy. Includes 2 soft-skill leadership modules and real-time business simulations.",
    highlights: [
      "Advanced Deep Learning & Transformer Architectures",
      "Custom Fine-Tuning & Retrieval-Augmented Generation (RAG)",
      "C-Suite AI Strategy, Ethics & Responsible AI",
      "Executive Capstone with University in New York Mentors"
    ],
    syllabus: [
      { module: "Term 1: Mathematical Foundations of AI & Machine Intelligence", weeks: "Months 1-3" },
      { module: "Term 2: Computer Vision, Transformers & Foundation Models", weeks: "Months 4-6" },
      { module: "Term 3: Enterprise RAG Pipelines & Autonomous Agents", weeks: "Months 7-9" },
      { module: "Term 4: Executive Business Simulation & Thesis Project", weeks: "Months 10-12" }
    ],
    prerequisites: "Bachelor's degree or higher in STEM, Business, or analytical field.",
    tuitionFee: "Special PGD Enrollment"
  }
];

window.CoursesService = {
  getAllCourses() {
    let stored = window.AcademicDB.getLocal(window.AcademicDB.keys.COURSES, null);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      window.AcademicDB.setLocal(window.AcademicDB.keys.COURSES, defaultCourses);
      return defaultCourses;
    }
    let modified = false;
    stored.forEach(c => {
      if (c.tuitionFee && (c.tuitionFee.includes("1,500") || c.tuitionFee.includes("1500"))) {
        c.tuitionFee = "Subsidized Intake (Application Fee applies)";
        modified = true;
      }
    });
    if (modified) {
      window.AcademicDB.setLocal(window.AcademicDB.keys.COURSES, stored);
    }
    return stored;
  },

  getCourseBySlug(slug) {
    if (!slug) return null;
    const courses = this.getAllCourses();
    const cleanSlug = slug.toLowerCase().trim();
    return courses.find(c => (c.slug && c.slug.toLowerCase() === cleanSlug) || c.id === slug) || null;
  },

  filterByCategory(category) {
    const courses = this.getAllCourses();
    if (!category || category === "all") return courses;
    return courses.filter(c => c.category === category);
  },

  search(query, category = "all") {
    let list = this.filterByCategory(category);
    if (!query || !query.trim()) return list;
    const q = query.toLowerCase().trim();
    return list.filter(c =>
      c.title.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.level && c.level.toLowerCase().includes(q))
    );
  },

  getFeatured() {
    const courses = this.getAllCourses();
    const featured = courses.filter(c => c.isFeatured && c.category === "job-ready");
    return featured.length > 0 ? featured : courses.filter(c => c.category === "job-ready").slice(0, 4);
  },

  /**
   * Seed all courses to the Supabase `courses` table if it is empty.
   * Uses upsert so it is safe to run multiple times.
   */
  async seedCoursesToSupabase() {
    const SUPA_URL = (window.AcademicDB && window.AcademicDB.SUPABASE_URL) || "https://tfmbmmtlppkzcxpndiym.supabase.co";
    const SUPA_KEY = (window.AcademicDB && window.AcademicDB.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbWJtbXRscHBremN4cG5kaXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MzE3MzMsImV4cCI6MjEwNTMwNzczM30.e1EUxECJgGBRp_BpyzTNH3QwUQHzRbNXVLpRMl_mk0Y";

    try {
      // Check if table already has rows
      const checkRes = await fetch(`${SUPA_URL}/rest/v1/courses?select=id&limit=1`, {
        headers: { "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}` }
      });
      if (!checkRes.ok) {
        console.info("Courses table not found in Supabase — skipping seed. Will use localStorage.");
        return;
      }
      const existing = await checkRes.json();
      if (Array.isArray(existing) && existing.length > 0) {
        console.info("Courses already seeded in Supabase.");
        return;
      }

      // Upsert all courses
      const payload = defaultCourses.map(c => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        category: c.category,
        category_label: c.categoryLabel,
        duration: c.duration,
        level: c.level,
        is_featured: c.isFeatured,
        description: c.description,
        prerequisites: c.prerequisites || null,
        tuition_fee: c.tuitionFee || null,
        highlights: JSON.stringify(c.highlights || []),
        syllabus: JSON.stringify(c.syllabus || [])
      }));

      const res = await fetch(`${SUPA_URL}/rest/v1/courses`, {
        method: "POST",
        headers: {
          "apikey": SUPA_KEY,
          "Authorization": `Bearer ${SUPA_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates,return=minimal"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok || res.status === 201) {
        console.log(`Seeded ${payload.length} courses to Supabase successfully.`);
      } else {
        const errText = await res.text();
        console.warn("Course seed response:", res.status, errText);
      }
    } catch (e) {
      console.info("Course seed skipped:", e.message);
    }
  }
};

// Auto-seed on load (safe — checks for existing data first)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => window.CoursesService.seedCoursesToSupabase());
} else {
  window.CoursesService.seedCoursesToSupabase();
}
