import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GraduationCap, Clock, Award, CheckCircle2, ArrowRight, ArrowLeft,
  BookOpen, Sparkles, ShieldCheck, Share2, Layers
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getCmsCourses, getCmsCourseBySlug, slugify } from "@/lib/cms-repo";
import { siteConfig } from "@/lib/content";

export async function generateStaticParams() {
  const courses = await getCmsCourses();
  return courses
    .filter((c) => Boolean(c.slug))
    .map((c) => ({ slug: c.slug! }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCmsCourseBySlug(slug);
  if (!course) {
    return { title: "Program Not Found" };
  }

  const metaDesc =
    course.description ||
    `Enroll in ${course.title} (${course.duration}, ${course.level}) through the Academic Excellence initiative. Subsidized online intake with University in New York credentials and Skillsoft Percipio labs.`;

  return {
    title: `${course.title} | Academic Excellence Program`,
    description: metaDesc,
    alternates: {
      canonical: `/courses/${slug}`,
    },
    openGraph: {
      title: `${course.title} — Academic Excellence`,
      description: metaDesc,
      url: `${siteConfig.url}/courses/${slug}`,
      siteName: siteConfig.name,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${course.title} | Academic Excellence`,
      description: metaDesc,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCmsCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const allCourses = await getCmsCourses();
  const relatedCourses = allCourses
    .filter((c) => c.id !== course.id && (c.category === course.category || c.is_featured))
    .slice(0, 3);

  const isPgd = course.category === "pgd";

  // SEO: Course & Breadcrumbs Structured Data
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description":
      course.description ||
      `Enroll in ${course.title} (${course.duration}, ${course.level}) through Academic Excellence.`,
    "provider": {
      "@type": "EducationalOrganization",
      "name": "Academic Excellence in partnership with University in New York",
      "sameAs": siteConfig.url,
    },
    "educationalCredentialAwarded": course.level,
    "timeRequired": course.duration,
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "Online",
      "courseWorkload": course.duration,
      "instructor": {
        "@type": "Organization",
        "name": "Skillsoft Percipio & University in New York Faculty",
      },
    },
    "offers": {
      "@type": "Offer",
      "category": "Subsidized Intake",
      "priceCurrency": "ETB",
      "availability": "https://schema.org/InStock",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteConfig.url,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Programs",
        "item": `${siteConfig.url}/#courses`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": course.title,
        "item": `${siteConfig.url}/courses/${slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      <main className="flex-grow pt-24 pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Subtle decorative mesh background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.3),rgba(255,255,255,0))] pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10">
            <Link
              href="/#courses"
              className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white transition-colors mb-6 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to All Programs
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-600/30 text-blue-300 border border-blue-500/30">
                {isPgd ? "Postgraduate Diploma" : "Job-Ready Global Program"}
              </span>
              {course.is_featured && (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> High Demand
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-300">
                {course.status}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight max-w-4xl">
              {course.title}
            </h1>

            <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
              {course.description || "Master industry-aligned technical and leadership skills certified in collaboration with University in New York and delivered via the Skillsoft Percipio platform."}
            </p>

            {/* Program Quick Specs */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl pt-6 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Duration</p>
                  <p className="text-sm font-semibold text-white">{course.duration}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Credential</p>
                  <p className="text-sm font-semibold text-white">{course.level}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mode</p>
                  <p className="text-sm font-semibold text-white">100% Online</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Eligibility</p>
                  <p className="text-sm font-semibold text-white">FAYDA ID / Degree</p>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href={`/apply?course=${encodeURIComponent(course.title)}`}>
                <Button size="lg" className="shadow-lg shadow-blue-600/30 group">
                  <span>Apply for This Program</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/track">
                <Button variant="outline" size="lg" className="border-slate-700 text-slate-200 hover:bg-slate-800">
                  Track Existing Application
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Content Details Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Learning Outcomes */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Key Learning Outcomes</h2>
                    <p className="text-xs text-slate-500">Core competencies gained upon successful completion</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {(course.learning_outcomes && course.learning_outcomes.length > 0
                    ? course.learning_outcomes
                    : [
                        `Master industry-standard frameworks and practical problem-solving in ${course.title}.`,
                        "Gain hands-on project experience with enterprise simulation environments.",
                        "Prepare for globally certified examinations recognized by employers worldwide.",
                        "Earn official verified digital credentials from University in New York and Skillsoft.",
                      ]
                  ).map((outcome, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{outcome}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialization / Curriculum Detail */}
              {course.specialization && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Curriculum Structure & Modules</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    This advanced track features intensive modular courses tailored for senior execution:
                  </p>
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-900 text-sm font-semibold">
                    {course.specialization}
                  </div>
                </div>
              )}

              {/* Accreditation & Badge Banner */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                      <Award className="w-4 h-4" /> Merit Badges & Honors
                    </div>
                    <h3 className="text-xl font-bold text-white">Graduation Distinction</h3>
                    <p className="text-xs text-blue-200 mt-1 max-w-md">
                      Learners achieving a GPA of 3.6+ earn an official Merit Badge. Scores exceeding 95% receive the prestigious A. Medallion of Merit.
                    </p>
                  </div>
                  <Link href={`/apply?course=${encodeURIComponent(course.title)}`} className="shrink-0">
                    <Button className="bg-white text-blue-950 hover:bg-blue-50 font-bold shadow-md">
                      Apply Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6 sticky top-24 h-max z-10">
              {/* Application Callout Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-1">Admissions Information</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Seats are allocated on a rolling admissions basis. Early application is strongly encouraged.
                </p>

                <div className="space-y-3 text-xs mb-6 divide-y divide-slate-100">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Delivery Platform:</span>
                    <span className="font-semibold text-slate-800">Skillsoft Percipio</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Language of Instruction:</span>
                    <span className="font-semibold text-slate-800">English</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Identification Required:</span>
                    <span className="font-semibold text-blue-600">Ethiopian FAYDA ID</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Tuition Support:</span>
                    <span className="font-semibold text-emerald-600">Subsidized Intake</span>
                  </div>
                </div>

                <Link href={`/apply?course=${encodeURIComponent(course.title)}`} className="block w-full">
                  <Button className="w-full justify-center shadow-md shadow-blue-600/20 py-3">
                    Enroll in {course.title.length > 25 ? "This Track" : course.title}
                  </Button>
                </Link>

                <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                  <p className="text-[11px] text-slate-400">
                    Questions? Contact the Admissions Desk at <a href="mailto:admissions@academice.edu.et" className="text-blue-600 font-semibold underline">admissions@academice.edu.et</a>
                  </p>
                </div>
              </div>

              {/* Related Courses */}
              {relatedCourses.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Other Recommended Tracks
                  </h4>
                  <div className="space-y-3">
                    {relatedCourses.map((rc) => (
                      <Link
                        key={rc.id}
                        href={`/courses/${rc.slug || slugify(rc.title)}`}
                        className="block p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors group"
                      >
                        <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {rc.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{rc.duration} • {rc.level}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
