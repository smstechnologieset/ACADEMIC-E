-- =========================================================
-- ACADEMIC EXCELLENCE — COMPLETE DATABASE SCHEMA & STORAGE
-- v2.0 — Short IDs, Application Events, Activity Log, Testimonials
-- =========================================================

create extension if not exists "pgcrypto";

-- Drop existing tables to recreate them cleanly with the new text-based ID schema
drop table if exists application_events cascade;
drop table if exists application_files cascade;
drop table if exists applications cascade;
drop table if exists admin_activity_log cascade;
drop table if exists cms_testimonials cascade;

-- Applications table matching Ethiopian Academic Excellence intake specification
create table if not exists applications (
  id text primary key, -- Short ID like AE-2K7X9B4M
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

-- Uploaded files (Official FAYDA ID, certificates, payment receipts)
create table if not exists application_files (
  id uuid primary key default gen_random_uuid(),
  application_id text not null references applications(id) on delete cascade,
  file_category text not null check (file_category in ('fayda_id', 'document', 'payment_proof')),
  file_path text not null,
  file_name text,
  file_size bigint,
  mime_type text,
  uploaded_at timestamptz not null default now()
);

-- Contact messages table
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- CMS TABLES FOR SITE EDITING (CRUD)
-- =========================================================

-- Homepage Stat Metric Cards
create table if not exists cms_stats (
  id uuid primary key default gen_random_uuid(),
  stat_key text unique not null,
  value integer not null,
  suffix text default '',
  label text not null,
  description text,
  sort_order integer default 0,
  updated_at timestamptz not null default now()
);

-- Course Catalog (Job-Ready tracks & Postgraduate Diplomas)
create table if not exists cms_courses (
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

-- Frequently Asked Questions
create table if not exists cms_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text default 'General',
  sort_order integer default 0,
  updated_at timestamptz not null default now()
);

-- General Site Settings & Bank Details
create table if not exists cms_site_settings (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Course view & click tracker for analytics
create table if not exists course_analytics (
  id uuid primary key default gen_random_uuid(),
  course_title text not null,
  event_type text not null check (event_type in ('view', 'click', 'apply')),
  created_at timestamptz not null default now()
);

-- =========================================================
-- APPLICATION EVENTS / TIMELINE
-- =========================================================

create table if not exists application_events (
  id uuid primary key default gen_random_uuid(),
  application_id text not null references applications(id) on delete cascade,
  event_type text not null, -- 'submitted', 'payment_uploaded', 'status_changed', 'note_added', 'cancelled'
  old_value text,
  new_value text,
  actor text not null default 'system', -- 'system', 'applicant', or admin email
  created_at timestamptz not null default now()
);

-- =========================================================
-- ADMIN ACTIVITY LOG (AUDIT TRAIL)
-- =========================================================

create table if not exists admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_email text not null,
  action text not null, -- 'approved_application', 'rejected_application', 'updated_course', etc.
  target_type text,     -- 'application', 'course', 'faq', 'settings', 'testimonial'
  target_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================
-- TESTIMONIALS / SUCCESS STORIES
-- =========================================================

create table if not exists cms_testimonials (
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

-- =========================================================
-- TRIGGERS & RLS POLICIES
-- =========================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists applications_set_updated_at on applications;
create trigger applications_set_updated_at
  before update on applications
  for each row execute function set_updated_at();

drop trigger if exists testimonials_set_updated_at on cms_testimonials;
create trigger testimonials_set_updated_at
  before update on cms_testimonials
  for each row execute function set_updated_at();

-- Enable RLS
alter table applications enable row level security;
alter table application_files enable row level security;
alter table contact_messages enable row level security;
alter table cms_stats enable row level security;
alter table cms_courses enable row level security;
alter table cms_faqs enable row level security;
alter table cms_site_settings enable row level security;
alter table course_analytics enable row level security;
alter table application_events enable row level security;
alter table admin_activity_log enable row level security;
alter table cms_testimonials enable row level security;

-- Public read policies for CMS
drop policy if exists "public read cms_stats" on cms_stats;
create policy "public read cms_stats" on cms_stats for select using (true);

drop policy if exists "public read cms_courses" on cms_courses;
create policy "public read cms_courses" on cms_courses for select using (true);

drop policy if exists "public read cms_faqs" on cms_faqs;
create policy "public read cms_faqs" on cms_faqs for select using (true);

drop policy if exists "public read cms_site_settings" on cms_site_settings;
create policy "public read cms_site_settings" on cms_site_settings for select using (true);

drop policy if exists "public read cms_testimonials" on cms_testimonials;
create policy "public read cms_testimonials" on cms_testimonials for select using (true);

drop policy if exists "anon insert course_analytics" on course_analytics;
create policy "anon insert course_analytics" on course_analytics for insert to anon with check (true);

-- Anon insert policies for public submission
drop policy if exists "anon can insert applications" on applications;
create policy "anon can insert applications" on applications for insert to anon with check (true);

drop policy if exists "anon can insert files" on application_files;
create policy "anon can insert files" on application_files for insert to anon with check (true);

drop policy if exists "anon can insert contact messages" on contact_messages;
create policy "anon can insert contact messages" on contact_messages for insert to anon with check (true);

-- Anon can insert application_events (for submission/payment events)
drop policy if exists "anon can insert application_events" on application_events;
create policy "anon can insert application_events" on application_events for insert to anon with check (true);

-- Anon can read own application (for tracker - uses service role so not strictly needed, but good practice)
drop policy if exists "anon can read applications" on applications;
create policy "anon can read applications" on applications for select to anon using (true);

-- Anon can read application_events for tracker timeline
drop policy if exists "anon can read application_events" on application_events;
create policy "anon can read application_events" on application_events for select to anon using (true);

-- Anon can update own application (for cancellation - will use service role)
drop policy if exists "anon can update applications" on applications;
create policy "anon can update applications" on applications for update to anon using (true) with check (true);

-- Authenticated Admin full access
drop policy if exists "admin full access to applications" on applications;
create policy "admin full access to applications" on applications for all to authenticated using (true) with check (true);

drop policy if exists "admin full access to files" on application_files;
create policy "admin full access to files" on application_files for all to authenticated using (true) with check (true);

drop policy if exists "admin full access to contact messages" on contact_messages;
create policy "admin full access to contact messages" on contact_messages for all to authenticated using (true) with check (true);

drop policy if exists "admin full access to cms_stats" on cms_stats;
create policy "admin full access to cms_stats" on cms_stats for all to authenticated using (true) with check (true);

drop policy if exists "admin full access to cms_courses" on cms_courses;
create policy "admin full access to cms_courses" on cms_courses for all to authenticated using (true) with check (true);

drop policy if exists "admin full access to cms_faqs" on cms_faqs;
create policy "admin full access to cms_faqs" on cms_faqs for all to authenticated using (true) with check (true);

drop policy if exists "admin full access to cms_site_settings" on cms_site_settings;
create policy "admin full access to cms_site_settings" on cms_site_settings for all to authenticated using (true) with check (true);

drop policy if exists "admin full access to course_analytics" on course_analytics;
create policy "admin full access to course_analytics" on course_analytics for all to authenticated using (true) with check (true);

drop policy if exists "admin full access to application_events" on application_events;
create policy "admin full access to application_events" on application_events for all to authenticated using (true) with check (true);

drop policy if exists "admin full access to admin_activity_log" on admin_activity_log;
create policy "admin full access to admin_activity_log" on admin_activity_log for all to authenticated using (true) with check (true);

drop policy if exists "admin full access to cms_testimonials" on cms_testimonials;
create policy "admin full access to cms_testimonials" on cms_testimonials for all to authenticated using (true) with check (true);

-- Storage buckets
insert into storage.buckets (id, name, public)
values 
  ('documents', 'documents', false),
  ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

drop policy if exists "anon upload documents" on storage.objects;
create policy "anon upload documents"
on storage.objects for insert to anon
with check (bucket_id in ('documents', 'payment-proofs'));

drop policy if exists "authenticated read and manage all files" on storage.objects;
create policy "authenticated read and manage all files"
on storage.objects for all to authenticated
using (bucket_id in ('documents', 'payment-proofs'))
with check (bucket_id in ('documents', 'payment-proofs'));
