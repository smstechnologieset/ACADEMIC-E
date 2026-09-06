/**
 * Academic Excellence — Courses Data & Catalog Service
 */

const defaultCourses = [
  {
    id: "course-1",
    title: "Artificial Intelligence (AI)",
    slug: "artificial-intelligence",
    category: "job-ready",
    categoryLabel: "Job-Ready (24 Weeks)",
    duration: "24 Weeks",
    level: "Accredited Certificate / Diploma",
    isFeatured: true,
    description: "Master industry-aligned technical and leadership skills certified in collaboration with University in New York and delivered via the Skillsoft Percipio platform.",
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
    tuitionFee: "Subsidized Intake (1,500 ETB Application Fee)"
  },
  {
    id: "course-2",
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
    tuitionFee: "Subsidized Intake (1,500 ETB Application Fee)"
  },
  {
    id: "course-3",
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
    tuitionFee: "Subsidized Intake (1,500 ETB Application Fee)"
  },
  {
    id: "course-4",
    title: "Cloud Computing (AWS & Azure)",
    slug: "cloud-computing-aws-azure",
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
    tuitionFee: "Subsidized Intake (1,500 ETB Application Fee)"
  },
  {
    id: "course-5",
    title: "Machine Learning Engineering",
    slug: "machine-learning-engineering",
    category: "job-ready",
    categoryLabel: "Job-Ready (24 Weeks)",
    duration: "24 Weeks",
    level: "Accredited Diploma",
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
    tuitionFee: "Subsidized Intake (1,500 ETB Application Fee)"
  },
  {
    id: "course-6",
    title: "Project Management Professional",
    slug: "project-management-professional",
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
    tuitionFee: "Subsidized Intake (1,500 ETB Application Fee)"
  },
  {
    id: "course-7",
    title: "Product Management",
    slug: "product-management",
    category: "job-ready",
    categoryLabel: "Job-Ready (24 Weeks)",
    duration: "24 Weeks",
    level: "Accredited Certificate",
    isFeatured: false,
    description: "Guide products from user research and minimum viable product (MVP) to market launch, growth loops, and data-driven iteration.",
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
    tuitionFee: "Subsidized Intake (1,500 ETB Application Fee)"
  },
  {
    id: "course-8",
    title: "Business Analytics & Strategy",
    slug: "business-analytics-strategy",
    category: "job-ready",
    categoryLabel: "Job-Ready (24 Weeks)",
    duration: "24 Weeks",
    level: "Accredited Diploma",
    isFeatured: false,
    description: "Equip modern business leaders with quantitative decision-making, financial modeling, market entry analysis, and data storytelling.",
    highlights: [
      "Financial Modeling & Sensitivity Analysis",
      "Market Sizing & Competitive Intelligence",
      "Executive Storytelling with Visual Dashboards",
      "Operations Research & Capital Allocation"
    ],
    syllabus: [
      { module: "Module 1: Quantitative Methods & Advanced Excel Modeling", weeks: "Weeks 1-6" },
      { module: "Module 2: Market Analysis, Economics & Strategic Positioning", weeks: "Weeks 7-12" },
      { module: "Module 3: PowerBI Executive Reporting & Data Pipelines", weeks: "Weeks 13-18" },
      { module: "Module 4: Comprehensive Strategy Board Presentation", weeks: "Weeks 19-24" }
    ],
    prerequisites: "Undergraduate degree or relevant business background.",
    tuitionFee: "Subsidized Intake (1,500 ETB Application Fee)"
  },
  {
    id: "course-9",
    title: "Postgraduate Diploma in Artificial Intelligence & Generative AI (AI/GAI)",
    slug: "pgd-artificial-intelligence-generative-ai",
    category: "pgd",
    categoryLabel: "Postgraduate Diploma (PGD)",
    duration: "12 Months (48 Weeks)",
    level: "Postgraduate Diploma (PGD)",
    isFeatured: true,
    description: "An intensive 12-month advanced postgraduate qualification featuring 6 specialization courses, 2 soft-skill leadership modules, and real-time business simulations.",
    highlights: [
      "Advanced Deep Learning & Transformer Architectures",
      "Custom Fine-Tuning & Retrieval-Augmented Generation (RAG)",
      "C-Suite AI Strategy, Ethics & Responsible AI",
      "Executive Capstone with University in New York Mentors"
    ],
    syllabus: [
      { module: "Term 1: Mathematical Foundations of AI & Machine Intelligence", weeks: "Weeks 1-12" },
      { module: "Term 2: Computer Vision, Transformers & Foundation Models", weeks: "Weeks 13-24" },
      { module: "Term 3: Enterprise RAG Pipelines & Autonomous Agents", weeks: "Weeks 25-36" },
      { module: "Term 4: Executive Business Simulation & Thesis Project", weeks: "Weeks 37-48" }
    ],
    prerequisites: "Bachelor's degree or higher in STEM, Business, or analytical field.",
    tuitionFee: "Special PGD Enrollment"
  },
  {
    id: "course-10",
    title: "Postgraduate Diploma in Information Technology",
    slug: "pgd-information-technology",
    category: "pgd",
    categoryLabel: "Postgraduate Diploma (PGD)",
    duration: "12 Months (48 Weeks)",
    level: "Postgraduate Diploma (PGD)",
    isFeatured: false,
    description: "Prepare for senior IT director, CTO, and systems architect roles with rigorous training in enterprise architecture, cloud infrastructure, and cybersecurity governance.",
    highlights: [
      "Enterprise Systems Architecture & Governance",
      "Cloud Infrastructure Migration Strategies",
      "IT Security Risk & Regulatory Compliance",
      "Strategic Technology Leadership & Budgeting"
    ],
    syllabus: [
      { module: "Term 1: Enterprise Information Systems & Database Architecture", weeks: "Weeks 1-12" },
      { module: "Term 2: Advanced Network Engineering & Cloud Virtualization", weeks: "Weeks 13-24" },
      { module: "Term 3: Enterprise IT Governance (ITIL, COBIT & ISO)", weeks: "Weeks 25-36" },
      { module: "Term 4: Strategic Technology Leadership Capstone", weeks: "Weeks 37-48" }
    ],
    prerequisites: "Bachelor's degree in IT, Engineering, Sciences, or related field.",
    tuitionFee: "Special PGD Enrollment"
  },
  {
    id: "course-11",
    title: "Postgraduate Diploma in Management",
    slug: "pgd-management",
    category: "pgd",
    categoryLabel: "Postgraduate Diploma (PGD)",
    duration: "12 Months (48 Weeks)",
    level: "Postgraduate Diploma (PGD)",
    isFeatured: false,
    description: "Develop executive leadership mastery with modules covering financial strategy, global supply chains, international trade, and organizational psychology.",
    highlights: [
      "Corporate Finance & Value Creation",
      "Cross-Border Supply Chain & Trade Logistics",
      "Strategic Marketing in Digital Ecosystems",
      "Organizational Change & High-Performance Teams"
    ],
    syllabus: [
      { module: "Term 1: Strategic Management & Executive Decision Frameworks", weeks: "Weeks 1-12" },
      { module: "Term 2: Managerial Finance & Global Market Economics", weeks: "Weeks 13-24" },
      { module: "Term 3: Operations, Technology Disruption & Agile Leadership", weeks: "Weeks 25-36" },
      { module: "Term 4: Global Business Simulation & Applied Management Thesis", weeks: "Weeks 37-48" }
    ],
    prerequisites: "Bachelor's degree in any discipline with professional work experience.",
    tuitionFee: "Special PGD Enrollment"
  }
];

window.CoursesService = {
  // Get all courses with local storage sync
  getAllCourses() {
    const stored = window.AcademicDB.getLocal(window.AcademicDB.keys.COURSES, null);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      window.AcademicDB.setLocal(window.AcademicDB.keys.COURSES, defaultCourses);
      return defaultCourses;
    }
    return stored;
  },

  // Get single course by slug
  getCourseBySlug(slug) {
    if (!slug) return null;
    const courses = this.getAllCourses();
    const cleanSlug = slug.toLowerCase().trim();
    return courses.find(c => (c.slug && c.slug.toLowerCase() === cleanSlug) || c.id === slug) || null;
  },

  // Filter by category
  filterByCategory(category) {
    const courses = this.getAllCourses();
    if (!category || category === "all") return courses;
    return courses.filter(c => c.category === category);
  },

  // Search by keyword
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

  // Get featured courses for homepage
  getFeatured() {
    const courses = this.getAllCourses();
    const featured = courses.filter(c => c.isFeatured);
    return featured.length > 0 ? featured : courses.slice(0, 4);
  }
};
