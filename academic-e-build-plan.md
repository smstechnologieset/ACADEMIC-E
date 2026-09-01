# Academic E — Application Platform
## Build Specification & Implementation Guide for AI Coding Agent

> **Read this entire document before writing any code.** This file is the single source of truth for scope, structure, data model, and design direction. When uncertain about a decision, check this doc first — if it's not covered, follow the closest existing pattern in this doc rather than inventing new architecture.

---

## 0. How to Use This Document

- This is a **build spec**, not a step-by-step tutorial. Use your judgment on exact implementation while staying inside these boundaries.
- Anything marked **`TODO (client)`** is a real placeholder — build with a sensible placeholder value/content, but don't treat it as final. Leave it easy to find/replace (e.g. a `content.ts` constants file, not hardcoded across 10 files).
- Anything marked **`ASSUMPTION`** is a decision made on the developer's behalf where the source contract was silent or ambiguous. Flag these back if something seems wrong, otherwise proceed.
- Work through **Section 16 (Build Order)** as your execution checklist.

---

## 1. Project Summary

Academic E needs an application-intake platform. A prospective applicant:
1. Lands on a marketing homepage explaining what Academic E offers.
2. Fills out an application form with their details.
3. Uploads required documents (PDFs).
4. Sees payment instructions (bank account + steps).
5. Uploads a screenshot/photo as proof of payment.
6. Gets a confirmation screen.
7. Later receives an **approval or rejection email** once an admin reviews everything.

Admin needs a private dashboard to see all applications, open each one, view the uploaded documents and payment proof, and approve/reject — which fires the notification email.

Contract timeline: 10 days. Contract calls this a "static website," but the required features (form handling, file storage, an authenticated admin panel, and emails) need real backend logic — see Section 4 for how that's reconciled.

---

## 2. Design Direction (Reference: ohubet.com)

Build the marketing pages with the same energy as **ohubet.com**, not a literal copy. Key patterns to borrow:

| Pattern | How to apply it here |
|---|---|
| Full-bleed hero with motion (video/gradient) | Hero section with a bold two-line headline, subtext, and a primary CTA ("Start Your Application"). Use a looping background video if provided, otherwise an animated gradient/mesh background. |
| Animated stat counters | Count-up numbers on scroll-into-view (e.g. "Applications Processed," "Avg. Review Time," "Approval Rate" — `TODO (client)` for real numbers, use tasteful placeholders like `500+`, `48h`, `92%` until replaced). |
| Numbered feature/process cards | Use for both "Why Apply With Us" and the "How It Works" section (Apply → Upload Docs → Pay → Get Reviewed → Confirmation). |
| Scroll-reveal sections | Fade + slide-up on scroll for every major section (Framer Motion `whileInView`). Don't overdo it — one motion pattern used consistently reads as more premium than five different ones. |
| Sticky nav, transparent → solid on scroll | Navbar starts transparent over the hero, becomes solid/blurred background after scrolling past it. |
| FAQ accordion | Optional addition (not in contract, but cheap to add and matches the reference site's modern feel) — 5–6 generic academic-application FAQs, `TODO (client)` for real copy. |
| Rounded cards, soft shadows, generous whitespace | Consistent border-radius scale (e.g. `rounded-2xl`), soft multi-layer shadows on hover (lift + shadow-grow), never harsh drop shadows. |

**Typography:** Pair a geometric/display sans for headings (e.g. `Space Grotesk` or `General Sans`) with a clean, highly-legible body font (`Inter`). Load via `next/font`.

**Color system** (`TODO (client)` — swap once real brand colors exist):
- Base: deep navy/charcoal (`#0B1220`-ish) for hero/dark sections, off-white (`#FAFAF9`) for light sections.
- Accent: one confident color for CTAs and highlights (placeholder: warm amber `#F5A623` or teal `#2DD4BF` — pick one and use it consistently, don't mix).
- Status colors for admin: green (approved), amber (pending/under review), red (rejected).

**Motion library:** `framer-motion`. Use it for scroll reveals, hover states, page/section transitions, and the stat counters. Keep animations snappy (200–400ms), never sluggish.

**Do not** use stock "corporate" clipart-style illustrations — prefer real (placeholder) photography, clean iconography (e.g. `lucide-react`), and typography-led design like the reference site.

---

## 3. Tech Stack

- **Framework:** Next.js 14+ (App Router), TypeScript, deployed on Vercel.
- **Styling:** Tailwind CSS. Optionally `shadcn/ui` for form primitives (input, select, dialog, table) to move faster — style tokens still driven by Tailwind theme.
- **Animation:** Framer Motion.
- **Icons:** `lucide-react`.
- **Backend / DB / Storage / Auth:** Supabase (Postgres + Storage + Auth).
- **Email:** Resend (simple API, generous free tier) triggered from a Supabase Edge Function. `ASSUMPTION`: no email provider was specified — Resend is the recommendation; swap the edge function's send call if the client already has a provider.
- **Forms:** `react-hook-form` + `zod` for validation.

### Why Next.js instead of a literal static export
`ASSUMPTION`: The contract's technical scope says "HTML, CSS, JavaScript," but the actual features requested (application form with DB writes, authenticated file uploads, an admin dashboard, server-triggered emails) are inherently dynamic. Marketing pages (home) are still statically generated at build time for speed; the application flow and `/admin` routes use Server Components/Server Actions talking to Supabase. This delivers the same "fast, modern, simple" feel the contract describes while actually supporting the required features.

---

## 4. Assumptions & Open Items

Confirm these with the client when possible; build with the stated default in the meantime.

| Item | Default used | Notes |
|---|---|---|
| Real bank account details for payment page | Placeholder bank name/account number | `TODO (client)` — must be swapped before launch |
| Brand colors/logo | Placeholder navy + amber palette | `TODO (client)` |
| Real marketing copy (about, services, stats) | Generic academic-consultancy placeholder copy | `TODO (client)` |
| Payment verification method | Manual: client uploads screenshot, admin eyeballs it and approves/rejects | Per contract — no payment gateway integration |
| Admin accounts | Single admin login, created manually in Supabase Studio (no public sign-up page) | Add more later if needed — schema doesn't block it |
| Applicant login/tracking | None — one-shot public submission, no applicant accounts | Contract doesn't mention applicants checking status themselves; they're notified by email instead |
| Domain, hosting, Supabase project costs | Client's responsibility | Per contract Section 7 |

---

## 5. Sitemap

```
/                     → Home (marketing)
/apply                → Application form (multi-step)
/payment-instructions → Shown after application submission
/confirmation          → Final "you're done" screen
/admin/login           → Admin sign-in
/admin/dashboard        → List/filter all applications
/admin/applications/[id] → Single application detail + approve/reject
```

---

## 6. Page-by-Page Specs

### `/` — Home
- Hero: headline, subtext, primary CTA → `/apply`, secondary CTA → scrolls to "How It Works."
- About section (short, what Academic E does).
- Animated stat counters row.
- "How It Works" — 5 numbered steps mirroring the actual flow (Apply → Upload Docs → Pay → We Review → Get Notified).
- FAQ accordion (optional, placeholder copy).
- Contact/footer with placeholder email, phone, socials — `TODO (client)`.

### `/apply` — Application Form (multi-step)
Step 1 — Personal details: full name, email, phone, program/area of interest (text or select), optional message.
Step 2 — Document upload: PDF upload(s), client-side validate file type/size (e.g. max 10MB, `.pdf` only). Show file name + remove option before submit.
Step 3 — Review & submit: read-only summary of steps 1–2, submit button.

On submit: insert into `applications` table, upload file(s) to Storage, insert rows into `application_files` (category `document`), then redirect to `/payment-instructions?ref=<application_id>`.

Use a persistent step indicator (progress bar/numbered steps) — this is a natural spot for a small, satisfying animation (checkmark pop, progress bar fill).

### `/payment-instructions`
- Displays bank name, account name, account number, amount, and step-by-step payment instructions (`TODO (client)` for real bank details).
- Upload field for payment proof (image or PDF screenshot).
- On upload submit: upload file to Storage, insert into `application_files` (category `payment_proof`) linked to the `application_id` from the query param, update `applications.status` to `under_review`.
- Redirect to `/confirmation`.

### `/confirmation`
- Simple, warm confirmation message: application + payment proof received, review timeline, "we'll email you." No further action needed on this page.

### `/admin/login`
- Email/password form via Supabase Auth. No public registration link.

### `/admin/dashboard`
- Table of all applications: name, email, submitted date, status badge (pending/under review/approved/rejected).
- Filter by status, basic search by name/email.
- Row click → `/admin/applications/[id]`.

### `/admin/applications/[id]`
- Applicant details.
- Document list with preview/download links (signed URLs).
- Payment proof preview.
- Approve / Reject buttons → update `applications.status`, then invoke the email Edge Function.
- Optional internal note field for the admin (not emailed to applicant).

---

## 7. Data Model (Supabase / Postgres)

```sql
-- Applications
create table applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  program_interest text,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'under_review', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Uploaded files (documents + payment proofs share one table, split by category)
create table application_files (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  file_category text not null check (file_category in ('document', 'payment_proof')),
  file_path text not null,       -- storage object path, not a public URL
  file_name text,
  uploaded_at timestamptz not null default now()
);

-- Keep updated_at fresh
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
```

### Row Level Security

```sql
alter table applications enable row level security;
alter table application_files enable row level security;

-- Public (anon) can create applications and attach files, but never read/edit/delete
create policy "anon can insert applications"
  on applications for insert to anon with check (true);

create policy "anon can insert files"
  on application_files for insert to anon with check (true);

-- Admin (authenticated) has full access
create policy "admin full access to applications"
  on applications for all to authenticated using (true) with check (true);

create policy "admin full access to files"
  on application_files for all to authenticated using (true) with check (true);
```

---

## 8. Storage & File Handling

- Create two Storage buckets: `documents` and `payment-proofs`. Keep both **private** (not public).
- Path convention: `{application_id}/{original_filename}`.
- Reads happen via short-lived **signed URLs** generated server-side (Server Action/Route Handler using the Supabase service role key), never client-side with the anon key.
- Client-side validation before upload: documents = `.pdf` only, max 10MB; payment proof = `.jpg/.png/.pdf`, max 5MB. Enforce the same limits server-side too — never trust the client.
- Storage policies: anon can `insert` only; authenticated (admin) can `select`/`delete`.

---

## 9. Auth & Admin Access

- Supabase Auth, email/password provider only. No public sign-up UI.
- Create the single admin user manually via Supabase Studio (Authentication → Users → Add user) — do not build a registration flow.
- Protect all `/admin/*` routes with middleware that checks for a valid Supabase session and redirects to `/admin/login` if missing.

---

## 10. Email Notifications

- Use a Supabase Edge Function (e.g. `send-status-email`) that accepts `application_id` and `status` (`approved` | `rejected`), fetches the applicant's email, and sends via the Resend API using a simple HTML template.
- Invoke it from the admin detail page right after the status update succeeds (`supabase.functions.invoke('send-status-email', { body: { application_id, status } })`).
- Two email templates: **Approved** (next steps, warm tone) and **Rejected** (respectful, brief, optionally inviting reapplication) — `TODO (client)` for final wording; ship with reasonable placeholder copy.

---

## 11. Suggested Folder Structure

```
/app
  /page.tsx                          → Home
  /apply/page.tsx                    → Application form
  /payment-instructions/page.tsx
  /confirmation/page.tsx
  /admin
    /login/page.tsx
    /dashboard/page.tsx
    /applications/[id]/page.tsx
  /actions                           → Server Actions (submitApplication, uploadPaymentProof, updateStatus)
/components
  /ui                                → Button, Card, Badge, ProgressSteps, StatCounter, etc.
  /sections                          → Hero, About, HowItWorks, Faq, Footer
  /forms                             → Multi-step ApplicationForm + steps
  /admin                             → ApplicationsTable, ApplicationDetail, StatusBadge
/lib
  /supabase
    client.ts                        → browser client (anon key)
    server.ts                        → server client (service role, server-only)
  content.ts                          → all TODO(client) placeholder copy, centralized
/supabase
  /functions/send-status-email
  schema.sql
```

---

## 12. SEO, Performance, Accessibility, Cross-Browser

- Set `metadata` (title, description, Open Graph) on every route via Next.js Metadata API.
- Generate `sitemap.xml` and `robots.txt`.
- Optimize images with `next/image`; lazy-load below-the-fold sections.
- Semantic HTML, labeled form fields, visible focus states, sufficient color contrast (check the accent color against both light/dark backgrounds).
- Test in latest Chrome, Firefox, Safari, and Edge; verify mobile responsiveness at common breakpoints (375px, 768px, 1024px, 1440px).

---

## 13. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-only, never exposed to client
RESEND_API_KEY=                  # used inside the Edge Function
```

---

## 14. Build Order (Execution Checklist)

1. Scaffold Next.js + TypeScript + Tailwind project; set up `next/font`, base theme tokens (colors, radius, shadows).
2. Set up Supabase project: run `schema.sql`, enable RLS policies, create Storage buckets + policies, create the single admin user.
3. Build shared UI primitives (`Button`, `Card`, `Badge`, `ProgressSteps`, `StatCounter`).
4. Build the marketing homepage sections top to bottom (Hero → About → Stats → How It Works → FAQ → Footer), wiring up scroll animations as you go.
5. Build the multi-step `/apply` form with validation, wired to a Server Action that writes to `applications` + `application_files` + Storage.
6. Build `/payment-instructions` (static content + upload) and `/confirmation`.
7. Build `/admin/login` + middleware-protected `/admin/dashboard` with the applications table.
8. Build `/admin/applications/[id]` with file previews (signed URLs) and approve/reject actions.
9. Build and deploy the `send-status-email` Edge Function; wire it to the approve/reject actions.
10. Full-flow QA: submit a real test application end to end, approve it, confirm the email arrives; repeat for reject.
11. SEO pass (metadata, sitemap, robots) + accessibility pass + cross-browser/responsive pass.
12. Replace all `TODO (client)` placeholders once real content/branding is provided; final deploy to Vercel.

---

## 15. Acceptance Criteria (mapped to contract)

- [ ] Home page with introduction/instructions (contract 4.1)
- [ ] Application form collecting applicant details (4.1)
- [ ] Document upload (PDF) (4.1)
- [ ] Payment instruction page with account number + steps (4.1)
- [ ] Payment proof upload (screenshot/image) (4.1)
- [ ] Confirmation message after submission (4.1)
- [ ] Admin panel to view applications, documents, payment proof (4.1)
- [ ] Email notification on approve/reject (4.1)
- [ ] Fully responsive (desktop/tablet/mobile) (4.2)
- [ ] Secure file upload handling (private storage, signed URLs) (4.2)
- [ ] Fast load / optimized performance (4.2)
- [ ] Clean, modern, OHUB-inspired interface (this brief)

---

## 16. Out of Scope (per contract)

- Payment gateway integration (manual proof upload only).
- Domain, hosting account, and any third-party service costs — client's responsibility.
- Applicant-facing login or status-tracking portal.
- Content/copywriting beyond placeholder text (client to supply final copy).
