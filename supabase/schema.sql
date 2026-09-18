-- =========================================================================
-- ACADEMIC EXCELLENCE — COMPLETE ONE-CLICK SUPABASE SETUP SCRIPT
-- Domain: academicexcellences.com
-- Sets up all Tables, Enums, RLS Security Policies, Storage Buckets,
-- Realtime Subscriptions, and Full Seed Data (Courses, Settings, FAQs, Stats).
-- =========================================================================

-- 1. EXTENSIONS
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- 2. DROP EXISTING OBJECTS (SAFE TEARDOWN FOR FRESH INITIALIZATION)
drop table if exists application_events cascade;
drop table if exists application_files cascade;
drop table if exists applications cascade;
drop table if exists admin_activity_log cascade;
drop table if exists contact_messages cascade;
drop table if exists course_analytics cascade;
drop table if exists courses cascade;
drop table if exists cms_courses cascade;
drop table if exists cms_stats cascade;
drop table if exists cms_faqs cascade;
drop table if exists cms_testimonials cascade;
drop table if exists site_settings cascade;
drop table if exists cms_site_settings cascade;

-- =========================================================================
-- 3. CORE APPLICATIONS & AUDIT TABLES
-- =========================================================================

-- Applications Table (Supports both Next.js & simpleHtlm)
create table applications (
  id text primary key, -- Custom reference like AE-2K7X9B4M
  first_name text not null,
  middle_name text,
  last_name text not null,
  full_name text not null,
  age integer,
  full_address text not null,
  phone text not null,
  email text not null,
  qualification text,
  course_applied text not null,
  signature text not null,
  place text not null,
  submission_date date not null default current_date,
  status text not null default 'pending'
    check (status in ('pending', 'under_review', 'approved', 'rejected', 'cancelled')),
  payment_method text,
  transaction_ref text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Uploaded Documents (FAYDA ID, Degree/Transcripts, Payment Proofs)
create table application_files (
  id uuid primary key default gen_random_uuid(),
  application_id text not null references applications(id) on delete cascade,
  file_category text not null check (file_category in ('fayda_id', 'document', 'payment_proof')),
  file_path text not null,
  file_name text,
  file_size bigint,
  mime_type text,
  uploaded_at timestamptz not null default now()
);

-- Timeline Events for Applicant Tracker
create table application_events (
  id uuid primary key default gen_random_uuid(),
  application_id text not null references applications(id) on delete cascade,
  event_type text not null, -- 'submitted', 'payment_uploaded', 'status_changed', 'cancelled'
  old_value text,
  new_value text,
  actor text not null default 'system',
  created_at timestamptz not null default now()
);

-- Admin Activity Audit Trail
create table admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_email text not null,
  action text not null,
  target_type text,
  target_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

-- Contact Inquiries
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  phone text,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

-- Analytics & Tracking
create table course_analytics (
  id uuid primary key default gen_random_uuid(),
  course_title text not null,
  event_type text not null check (event_type in ('view', 'click', 'apply')),
  created_at timestamptz not null default now()
);

-- =========================================================================
-- 4. CMS & SITE CONFIGURATION TABLES
-- =========================================================================

-- Key-Value Site Settings (Used by simpleHtlm & dynamic loaders)
create table site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- JSONB Site Settings (Used by Next.js Admin & CMS)
create table cms_site_settings (
  id text primary key default 'primary_settings',
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Course Catalog (simpleHtlm compatible with full highlights and syllabi)
create table courses (
  id text primary key,
  title text not null,
  slug text unique,
  category text not null default 'job-ready',
  category_label text,
  duration text not null default '24 Weeks',
  level text not null default 'Accredited Certificate / Diploma',
  is_featured boolean default false,
  description text,
  prerequisites text,
  tuition_fee text default 'Subsidized Intake (Application Fee applies)',
  highlights jsonb default '[]'::jsonb,
  syllabus jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Course Catalog (Next.js CMS compatible)
create table cms_courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  duration text not null default '24 Weeks',
  level text not null default 'Certificate / Diploma',
  category text not null default 'job-ready' check (category in ('job-ready', 'pgd', 'tech', 'business')),
  specialization text,
  description text,
  learning_outcomes text[],
  status text not null default 'Active',
  is_featured boolean default false,
  sort_order integer default 0,
  clicks_count integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Homepage Metric Statistics
create table cms_stats (
  id uuid primary key default gen_random_uuid(),
  stat_key text unique not null,
  value integer not null,
  suffix text default '',
  label text not null,
  description text,
  sort_order integer default 0,
  updated_at timestamptz not null default now()
);

-- Frequently Asked Questions
create table cms_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text default 'General',
  sort_order integer default 0,
  updated_at timestamptz not null default now()
);

-- Testimonials & Student Success Stories
create table cms_testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  quote text not null,
  course_completed text,
  rating integer default 5 check (rating >= 1 and rating <= 5),
  is_featured boolean default true,
  sort_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================================
-- 5. AUTOMATED TIMESTAMP UPDATE TRIGGERS
-- =========================================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger applications_set_updated_at
  before update on applications
  for each row execute function set_updated_at();

create trigger courses_set_updated_at
  before update on courses
  for each row execute function set_updated_at();

create trigger cms_courses_set_updated_at
  before update on cms_courses
  for each row execute function set_updated_at();

create trigger testimonials_set_updated_at
  before update on cms_testimonials
  for each row execute function set_updated_at();

create trigger site_settings_set_updated_at
  before update on site_settings
  for each row execute function set_updated_at();

create trigger cms_site_settings_set_updated_at
  before update on cms_site_settings
  for each row execute function set_updated_at();

-- =========================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

alter table applications enable row level security;
alter table application_files enable row level security;
alter table application_events enable row level security;
alter table admin_activity_log enable row level security;
alter table contact_messages enable row level security;
alter table course_analytics enable row level security;
alter table courses enable row level security;
alter table cms_courses enable row level security;
alter table cms_stats enable row level security;
alter table cms_faqs enable row level security;
alter table cms_testimonials enable row level security;
alter table site_settings enable row level security;
alter table cms_site_settings enable row level security;

-- --- Public / Anonymous Read Policies ---
create policy "Public Read Courses" on courses for select using (true);
create policy "Public Read CMS Courses" on cms_courses for select using (true);
create policy "Public Read Stats" on cms_stats for select using (true);
create policy "Public Read FAQs" on cms_faqs for select using (true);
create policy "Public Read Testimonials" on cms_testimonials for select using (true);
create policy "Public Read Site Settings" on site_settings for select using (true);
create policy "Public Read CMS Settings" on cms_site_settings for select using (true);
create policy "Public Read Applications" on applications for select using (true);
create policy "Public Read Application Files" on application_files for select using (true);
create policy "Public Read Application Events" on application_events for select using (true);

-- --- Public / Anonymous Write Policies ---
create policy "Anon Insert Applications" on applications for insert with check (true);
create policy "Anon Update Applications" on applications for update using (true) with check (true);
create policy "Anon Insert Files" on application_files for insert with check (true);
create policy "Anon Insert Events" on application_events for insert with check (true);
create policy "Anon Insert Contact" on contact_messages for insert with check (true);
create policy "Anon Insert Analytics" on course_analytics for insert with check (true);

-- --- Authenticated / Admin Full Control Policies ---
create policy "Admin All Applications" on applications for all to authenticated using (true) with check (true);
create policy "Admin All Files" on application_files for all to authenticated using (true) with check (true);
create policy "Admin All Events" on application_events for all to authenticated using (true) with check (true);
create policy "Admin All Activity Log" on admin_activity_log for all to authenticated using (true) with check (true);
create policy "Admin All Contact Messages" on contact_messages for all to authenticated using (true) with check (true);
create policy "Admin All Analytics" on course_analytics for all to authenticated using (true) with check (true);
create policy "Admin All Courses" on courses for all to authenticated using (true) with check (true);
create policy "Admin All CMS Courses" on cms_courses for all to authenticated using (true) with check (true);
create policy "Admin All Stats" on cms_stats for all to authenticated using (true) with check (true);
create policy "Admin All FAQs" on cms_faqs for all to authenticated using (true) with check (true);
create policy "Admin All Testimonials" on cms_testimonials for all to authenticated using (true) with check (true);
create policy "Admin All Site Settings" on site_settings for all to authenticated using (true) with check (true);
create policy "Admin All CMS Settings" on cms_site_settings for all to authenticated using (true) with check (true);

-- =========================================================================
-- 7. STORAGE BUCKETS & STORAGE POLICIES
-- =========================================================================

insert into storage.buckets (id, name, public)
values 
  ('documents', 'documents', true),
  ('payment-proofs', 'payment-proofs', true)
on conflict (id) do update set public = true;

-- Storage RLS
drop policy if exists "Anon Upload Documents" on storage.objects;
create policy "Anon Upload Documents"
on storage.objects for insert
with check (bucket_id in ('documents', 'payment-proofs'));

drop policy if exists "Public Read Documents" on storage.objects;
create policy "Public Read Documents"
on storage.objects for select
using (bucket_id in ('documents', 'payment-proofs'));

drop policy if exists "Admin Full Storage Access" on storage.objects;
create policy "Admin Full Storage Access"
on storage.objects for all to authenticated
using (bucket_id in ('documents', 'payment-proofs'))
with check (bucket_id in ('documents', 'payment-proofs'));

-- =========================================================================
-- 8. REALTIME REPLICATION SETUP
-- =========================================================================

alter publication supabase_realtime add table applications;
alter publication supabase_realtime add table application_events;
alter publication supabase_realtime add table site_settings;

-- =========================================================================
-- 9. SEED DATA (INTAKE SETTINGS, COURSES, STATS & FAQS)
-- =========================================================================

-- --- 9.1 Site Settings (Key-Value) ---
insert into site_settings (key, value) values
  ('applicationFee', '15,000 ETB'),
  ('applicationFeeAmount', '15000'),
  ('telebirrNumber', '0911 55 2345'),
  ('cbeAccount', '1000 3948 29384'),
  ('awashAccount', '0132 0876 5432 10'),
  ('currency', 'ETB'),
  ('contactEmail', 'admin@academicexcellences.com'),
  ('partnershipsEmail', 'admin@academicexcellences.com'),
  ('phone', '+251 11 555 2345'),
  ('address', 'Bole Sub-City, Education Hub, Addis Ababa, Ethiopia')
on conflict (key) do update set value = excluded.value;

-- --- 9.2 CMS Site Settings (JSONB) ---
insert into cms_site_settings (id, data) values
  ('primary_settings', '{
    "applicationFee": "15,000 ETB",
    "applicationFeeAmount": 15000,
    "telebirrNumber": "0911 55 2345",
    "cbeAccount": "1000 3948 29384",
    "awashAccount": "0132 0876 5432 10",
    "currency": "ETB",
    "contactEmail": "admin@academicexcellences.com",
    "partnershipsEmail": "admin@academicexcellences.com",
    "phone": "+251 11 555 2345",
    "address": "Bole Sub-City, Education Hub, Addis Ababa, Ethiopia"
  }'::jsonb)
on conflict (id) do update set data = excluded.data;

-- --- 9.3 Metric Statistics ---
insert into cms_stats (stat_key, value, suffix, label, description, sort_order) values
  ('courses_count', 10000, '+', 'Specialized Courses', 'Industry-aligned courses across high-demand disciplines', 1),
  ('programs_count', 120, '+', 'Diploma & Cert Programs', 'Programs certified with University in New York', 2),
  ('completion_weeks', 24, ' wks', 'Completion Window', 'Flexible, self-paced learning for students & professionals', 3),
  ('high_achiever_gpa', 4, '+', 'High Achiever GPA (3.6+)', 'Eligible for Academic Excellence Medallion of Merit', 4)
on conflict (stat_key) do nothing;

-- --- 9.4 Frequently Asked Questions ---
insert into cms_faqs (question, answer, category, sort_order) values
  ('What is Academic Excellence and who are the partners?', 'Academic Excellence is an educational initiative established to expand equitable access to internationally recognized education for Ethiopian learners. We operate in strategic partnership with international institutions and the University in New York, with course delivery powered by Skillsoft Percipio.', 'General', 1),
  ('What is FAYDA ID and why is it required for application?', 'The FAYDA ID is Ethiopia''s official National Digital Identification. It allows our admissions board to certify applicant identity and grant subsidized tuition access reserved for Ethiopian learners and professionals.', 'Admissions', 2),
  ('What credentials do learners receive upon course completion?', 'Graduates receive globally recognized diplomas and certificates endorsed by the University in New York. High-achieving learners (GPA 3.6+) are awarded the Academic Excellence Medallion of Merit.', 'Academic', 3),
  ('How long do the Job-Ready and Postgraduate Diploma programs take?', 'Job-Ready Diploma programs are structured for 24 weeks of self-paced learning. Postgraduate Diploma (PGD) programs are intensive 12-month curricula featuring 6 specialization courses and business simulations.', 'Programs', 4),
  ('How do I complete the application fee payment?', 'The subsidized application fee of 15,000 ETB can be paid via Telebirr (0911 55 2345), Commercial Bank of Ethiopia (CBE - 1000 3948 29384), or Awash Bank (0132 0876 5432 10). After depositing, upload your transaction reference or slip.', 'Payment', 5)
on conflict do nothing;

-- --- 9.5 Testimonials ---
insert into cms_testimonials (name, role, quote, course_completed, rating, is_featured, sort_order) values
  ('Dawit Haile', 'AI Engineer at Ethio Telecom', 'The AI diploma gave me the exact skills and lab experience needed to step into enterprise machine learning pipelines. The U.S. certification opened international doors for me.', 'Artificial Intelligence (AI)', 5, true, 1),
  ('Selamawit Girma', 'Senior Data Analyst', 'Studying while working was seamless on the Percipio portal. The curriculum bridges theory with real-world SQL and analytics dashboards.', 'Data Science and Big Data', 5, true, 2),
  ('Yohannes Abebe', 'Cybersecurity Specialist', 'The ethical hacking virtual labs prepared me directly for SOC analysis. The FAYDA subsidized intake made world-class training accessible right here in Addis Ababa.', 'Cybersecurity and Ethical Hacking', 5, true, 3)
on conflict do nothing;

-- --- 9.6 Complete Course Catalog (All 12 Official Programs) ---
insert into courses (id, title, slug, category, category_label, duration, level, is_featured, description, prerequisites, tuition_fee, highlights, syllabus) values
(
  'course-ai',
  'Artificial Intelligence (AI)',
  'artificial-intelligence',
  'job-ready',
  'Job-Ready (24 Weeks)',
  '24 Weeks',
  'Accredited Certificate / Diploma',
  true,
  'Master core neural networks, deep learning, LLMs, and generative AI. Certified in collaboration with University in New York and delivered via the Skillsoft Percipio platform.',
  'Basic programming familiarity or mathematical aptitude; Bachelor''s, Diploma, or relevant analytical background recommended.',
  'Subsidized Intake (Application Fee applies)',
  '["Core Neural Networks, Deep Learning & LLMs", "Python, TensorFlow & PyTorch Lab Exercises", "Ethics, Governance & Generative AI Integration", "Real-world capstone portfolio for global employment"]'::jsonb,
  '[{"module": "Module 1: Foundations of Artificial Intelligence & Python Computing", "weeks": "Weeks 1-4"}, {"module": "Module 2: Supervised & Unsupervised Machine Learning Algorithms", "weeks": "Weeks 5-10"}, {"module": "Module 3: Deep Learning, CNNs & Natural Language Processing", "weeks": "Weeks 11-16"}, {"module": "Module 4: Enterprise Generative AI, APIs & Capstone Project", "weeks": "Weeks 17-24"}]'::jsonb
),
(
  'course-data-science',
  'Data Science and Big Data',
  'data-science-and-big-data',
  'job-ready',
  'Job-Ready (24 Weeks)',
  '24 Weeks',
  'Accredited Certificate / Diploma',
  true,
  'Transform complex data into strategic business intelligence using modern statistical computing, SQL pipelines, and cloud analytics.',
  'Interest in quantitative methods, business metrics, or software tooling.',
  'Subsidized Intake (Application Fee applies)',
  '["Exploratory Data Analysis with Pandas & NumPy", "Relational & NoSQL Big Data Pipelines", "Interactive Dashboards (Tableau & PowerBI)", "Predictive Modeling & Statistical Forecasting"]'::jsonb,
  '[{"module": "Module 1: Advanced SQL, Data Wrangling & Python Analytics", "weeks": "Weeks 1-6"}, {"module": "Module 2: Statistical Modeling & Exploratory Analysis", "weeks": "Weeks 7-12"}, {"module": "Module 3: Big Data Architecture (Spark, Hadoop & Cloud Storage)", "weeks": "Weeks 13-18"}, {"module": "Module 4: Enterprise BI Dashboards & Capstone Project", "weeks": "Weeks 19-24"}]'::jsonb
),
(
  'course-cybersecurity',
  'Cybersecurity and Ethical Hacking',
  'cybersecurity-and-ethical-hacking',
  'job-ready',
  'Job-Ready (24 Weeks)',
  '24 Weeks',
  'Accredited Certificate / Diploma',
  true,
  'Protect enterprise digital assets through zero-trust defense architectures, penetration testing, threat detection, and incident response.',
  'Basic understanding of operating systems, computing hardware, or networking.',
  'Subsidized Intake (Application Fee applies)',
  '["Network Vulnerability Assessment & Penetration Labs", "Zero-Trust Architecture & Cryptography", "SOC Analysis, Threat Hunting & SIEM Monitoring", "International Security Compliance & Standards"]'::jsonb,
  '[{"module": "Module 1: Network Protocols, Defensive Security & Firewalls", "weeks": "Weeks 1-6"}, {"module": "Module 2: Vulnerability Analysis & Ethical Penetration Testing", "weeks": "Weeks 7-12"}, {"module": "Module 3: Incident Response, Forensics & Cloud Security", "weeks": "Weeks 13-18"}, {"module": "Module 4: Security Operations Center (SOC) Simulation", "weeks": "Weeks 19-24"}]'::jsonb
),
(
  'course-cloud',
  'Cloud Computing',
  'cloud-computing',
  'job-ready',
  'Job-Ready (24 Weeks)',
  '24 Weeks',
  'Accredited Certificate / Diploma',
  true,
  'Design resilient, scalable cloud architectures across AWS and Microsoft Azure with DevOps automation and containerization.',
  'Familiarity with IT systems, computer networking, or web development.',
  'Subsidized Intake (Application Fee applies)',
  '["Multi-Cloud Architecture (AWS & Microsoft Azure)", "Docker Containers, Kubernetes & CI/CD Pipelines", "Serverless Architecture & Infrastructure as Code (Terraform)", "Cloud Cost Optimization & High Availability"]'::jsonb,
  '[{"module": "Module 1: Cloud Principles, Virtualization & Compute Storage", "weeks": "Weeks 1-5"}, {"module": "Module 2: AWS Solutions Architecture & IAM Security", "weeks": "Weeks 6-11"}, {"module": "Module 3: Microsoft Azure Administration & Hybrid Deployments", "weeks": "Weeks 12-17"}, {"module": "Module 4: DevOps Automation, Kubernetes & Live Migration", "weeks": "Weeks 18-24"}]'::jsonb
),
(
  'course-machine-learning',
  'Machine Learning',
  'machine-learning',
  'job-ready',
  'Job-Ready (24 Weeks)',
  '24 Weeks',
  'Accredited Certificate / Diploma',
  false,
  'Bridge research algorithms with robust production pipelines using MLOps, automated training, model monitoring, and scalable inference.',
  'Prior programming experience in Python.',
  'Subsidized Intake (Application Fee applies)',
  '["Production Model Deployment & Monitoring", "Feature Stores, Data Validation & CI/CD for ML", "Dockerized ML Microservices on Cloud", "End-to-End Real-Time Predictive Engines"]'::jsonb,
  '[{"module": "Module 1: Advanced ML Mathematics & Model Optimization", "weeks": "Weeks 1-6"}, {"module": "Module 2: MLOps, Model Versioning & MLflow Pipelines", "weeks": "Weeks 7-12"}, {"module": "Module 3: Scalable Inference, FastAPI & Kubernetes", "weeks": "Weeks 13-18"}, {"module": "Module 4: Production Capstone with Live Monitoring", "weeks": "Weeks 19-24"}]'::jsonb
),
(
  'course-project-management',
  'Project Management',
  'project-management',
  'job-ready',
  'Job-Ready (24 Weeks)',
  '24 Weeks',
  'Accredited Certificate',
  false,
  'Align enterprise goals with disciplined delivery across Agile, Scrum, Kanban, and traditional waterfall project management frameworks.',
  'Open to graduates and aspiring managers in all disciplines.',
  'Subsidized Intake (Application Fee applies)',
  '["Agile & Scrum Master Leadership Certifications", "Risk Management, Budgeting & Resource Allocation", "Jira, Confluence & Modern Enterprise Workflows", "Cross-functional Stakeholder Communication"]'::jsonb,
  '[{"module": "Module 1: Project Initiation, Scope Definition & Charters", "weeks": "Weeks 1-6"}, {"module": "Module 2: Agile Frameworks, Sprints & Team Velocity", "weeks": "Weeks 7-12"}, {"module": "Module 3: Enterprise Risk, Procurement & Budgeting", "weeks": "Weeks 13-18"}, {"module": "Module 4: Complex Delivery Simulation & Capstone", "weeks": "Weeks 19-24"}]'::jsonb
),
(
  'course-product-management',
  'Product Management',
  'product-management',
  'job-ready',
  'Job-Ready (24 Weeks)',
  '24 Weeks',
  'Accredited Certificate',
  false,
  'Guide products from user research and MVP to market launch, growth loops, and data-driven iteration.',
  'Strong communication skills and passion for technology products.',
  'Subsidized Intake (Application Fee applies)',
  '["User Discovery, Wireframing & Prototyping", "Product Strategy, Roadmapping & Prioritization", "Metrics (CAC, LTV, Retention, Product-Market Fit)", "Go-to-Market Strategy & Cross-Team Orchestration"]'::jsonb,
  '[{"module": "Module 1: Market Research, Customer Discovery & Problem Definition", "weeks": "Weeks 1-6"}, {"module": "Module 2: Product Roadmaps, PRDs & Agile Sprints", "weeks": "Weeks 7-12"}, {"module": "Module 3: Analytics, A/B Testing & Unit Economics", "weeks": "Weeks 13-18"}, {"module": "Module 4: Complete Product Launch Simulation", "weeks": "Weeks 19-24"}]'::jsonb
),
(
  'course-business-leadership',
  'Business and Leadership Skills',
  'business-and-leadership-skills',
  'job-ready',
  'Job-Ready (24 Weeks)',
  '24 Weeks',
  'Accredited Certificate / Diploma',
  false,
  'Develop executive decision-making, strategic thinking, cross-cultural team management, financial fundamentals, and digital transformation leadership skills.',
  'Undergraduate degree or relevant professional experience.',
  'Subsidized Intake (Application Fee applies)',
  '["Executive Decision Making & Strategic Planning", "Cross-Cultural Team Management", "Financial Fundamentals & Budget Management", "Digital Transformation Strategy & Change Management"]'::jsonb,
  '[{"module": "Module 1: Leadership Fundamentals & Organizational Behavior", "weeks": "Weeks 1-6"}, {"module": "Module 2: Strategic Management & Business Analytics", "weeks": "Weeks 7-12"}, {"module": "Module 3: Financial Acumen & Operations Management", "weeks": "Weeks 13-18"}, {"module": "Module 4: Digital Leadership & Executive Capstone", "weeks": "Weeks 19-24"}]'::jsonb
),
(
  'course-communication-productivity',
  'Communication and Productivity Skills',
  'communication-and-productivity-skills',
  'job-ready',
  'Job-Ready (24 Weeks)',
  '24 Weeks',
  'Accredited Certificate',
  false,
  'Master professional communication, workplace productivity tools, collaboration platforms, and the interpersonal skills demanded by modern employers.',
  'Open to all applicants; no prior technical knowledge required.',
  'Subsidized Intake (Application Fee applies)',
  '["Professional Writing & Presentation Skills", "Microsoft 365, Google Workspace & Collaboration Tools", "Critical Thinking & Problem Solving", "Time Management & Personal Effectiveness"]'::jsonb,
  '[{"module": "Module 1: Professional Communication & Business Writing", "weeks": "Weeks 1-6"}, {"module": "Module 2: Productivity Tools & Digital Collaboration", "weeks": "Weeks 7-12"}, {"module": "Module 3: Critical Thinking, Negotiation & Influence", "weeks": "Weeks 13-18"}, {"module": "Module 4: Personal Effectiveness & Career Development", "weeks": "Weeks 19-24"}]'::jsonb
),
(
  'course-professional-certifications',
  'Professional Certifications',
  'professional-certifications',
  'job-ready',
  'Job-Ready (24 Weeks)',
  '24 Weeks',
  'Accredited Certificate',
  false,
  'Prepare for globally recognized professional certification exams across IT, project management, and business domains with structured exam-ready curricula.',
  'Relevant experience in the chosen certification domain preferred.',
  'Subsidized Intake (Application Fee applies)',
  '["PMP, CompTIA, AWS & Microsoft Certification Prep", "Practice Exams & Exam Strategy Coaching", "Industry-Aligned Study Materials", "Skillsoft Percipio Certification Pathways"]'::jsonb,
  '[{"module": "Module 1: Certification Landscape & Exam Preparation Foundations", "weeks": "Weeks 1-6"}, {"module": "Module 2: Domain-Specific Technical Deep Dives", "weeks": "Weeks 7-14"}, {"module": "Module 3: Practice Exams, Mock Tests & Gap Analysis", "weeks": "Weeks 15-20"}, {"module": "Module 4: Final Revision & Exam Simulation", "weeks": "Weeks 21-24"}]'::jsonb
),
(
  'course-pgd-management',
  'Postgraduate Diploma in Management',
  'pgd-management',
  'pgd',
  'Postgraduate Diploma (PGD)',
  '12 Months',
  'Postgraduate Diploma (PGD)',
  true,
  'Advanced postgraduate qualification covering Project Management, Human Resource Management, Marketing, Digital Marketing, Business Analytics, Strategy & Innovation, Leadership, Entrepreneurship, Financial Management, and Digital Transformation. Includes 2 professional soft-skill courses and access to Business Simulation Game.',
  'Bachelor''s degree in any discipline with professional work experience.',
  'Special PGD Enrollment',
  '["Six specialization courses from 14+ available areas", "Two professional soft-skill courses", "80+ hours of learning per specialization course", "Business Simulation Game: My Business – My Strategies"]'::jsonb,
  '[{"module": "Term 1: Strategic Management & Executive Decision Frameworks", "weeks": "Months 1-3"}, {"module": "Term 2: Managerial Finance & Global Market Economics", "weeks": "Months 4-6"}, {"module": "Term 3: Operations, Technology Disruption & Agile Leadership", "weeks": "Months 7-9"}, {"module": "Term 4: Global Business Simulation & Applied Management Thesis", "weeks": "Months 10-12"}]'::jsonb
),
(
  'course-pgd-it',
  'Postgraduate Diploma in Information Technology',
  'pgd-information-technology',
  'pgd',
  'Postgraduate Diploma (PGD)',
  '12 Months',
  'Postgraduate Diploma (PGD)',
  false,
  'Advanced postgraduate IT qualification covering Cybersecurity, AI, Machine Learning, Data Science, Cloud Computing, Ethical Hacking, Python, Big Data, Blockchain, AWS, Azure, IoT, and Networking. Includes 2 professional soft-skill courses.',
  'Bachelor''s degree in IT, Engineering, Sciences, or related field.',
  'Special PGD Enrollment',
  '["Six specialization courses from 14+ available areas", "Two professional soft-skill courses", "80+ hours of learning per specialization course", "Business Simulation Game: My Business – My Strategies"]'::jsonb,
  '[{"module": "Term 1: Enterprise Information Systems & Database Architecture", "weeks": "Months 1-3"}, {"module": "Term 2: Advanced Network Engineering & Cloud Virtualization", "weeks": "Months 4-6"}, {"module": "Term 3: Enterprise IT Governance (ITIL, COBIT & ISO)", "weeks": "Months 7-9"}, {"module": "Term 4: Strategic Technology Leadership Capstone", "weeks": "Months 10-12"}]'::jsonb
),
(
  'course-pgd-ai-gai',
  'Postgraduate Diploma in Artificial Intelligence & Generative AI (AI/GAI)',
  'pgd-artificial-intelligence-generative-ai',
  'pgd',
  'Postgraduate Diploma (PGD)',
  '12 Months',
  'Postgraduate Diploma (PGD)',
  true,
  'Intensive 12-month postgraduate qualification featuring 6 specialization courses in AI, Machine Learning, Generative AI, and enterprise AI strategy. Includes 2 soft-skill leadership modules and real-time business simulations.',
  'Bachelor''s degree or higher in STEM, Business, or analytical field.',
  'Special PGD Enrollment',
  '["Advanced Deep Learning & Transformer Architectures", "Custom Fine-Tuning & Retrieval-Augmented Generation (RAG)", "C-Suite AI Strategy, Ethics & Responsible AI", "Executive Capstone with University in New York Mentors"]'::jsonb,
  '[{"module": "Term 1: Mathematical Foundations of AI & Machine Intelligence", "weeks": "Months 1-3"}, {"module": "Term 2: Computer Vision, Transformers & Foundation Models", "weeks": "Months 4-6"}, {"module": "Term 3: Enterprise RAG Pipelines & Autonomous Agents", "weeks": "Months 7-9"}, {"module": "Term 4: Executive Business Simulation & Thesis Project", "weeks": "Months 10-12"}]'::jsonb
)
on conflict (id) do nothing;

-- Mirror to cms_courses table for Next.js CMS
insert into cms_courses (title, slug, duration, level, category, description, is_featured, sort_order)
select 
  title,
  slug,
  duration,
  level,
  case when category = 'pgd' then 'pgd' else 'job-ready' end,
  description,
  is_featured,
  row_number() over ()
from courses
on conflict (slug) do nothing;

-- =========================================================================
-- SETUP COMPLETE!
-- All tables, RLS policies, storage buckets, and official course seeds ready.
-- =========================================================================
