import { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { getCmsCourses } from "@/lib/cms-repo";
import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Online Application Intake | Academic Excellence Ethiopia",
  description:
    "Complete your official Academic Excellence application dossier. Subsidized higher education intake with Ethiopian FAYDA ID verification.",
  alternates: {
    canonical: "/apply",
  },
  openGraph: {
    title: "Apply Online | Academic Excellence Ethiopia",
    description:
      "Start your application for 120+ job-ready courses and postgraduate diplomas in partnership with University in New York.",
    url: `${siteConfig.url}/apply`,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apply Online | Academic Excellence Ethiopia",
    description: "Subsidized education intake with Ethiopian FAYDA ID verification.",
  },
};

export default async function ApplyPage() {
  const courses = await getCmsCourses();

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
        "name": "Online Application",
        "item": `${siteConfig.url}/apply`,
      },
    ],
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />
      <div className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1 block">
            Academic Excellence Ethiopia
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Online Application Intake
          </h1>
          <p className="mt-2 text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
            Please fill out all questionnaire sections accurately and upload your official Ethiopian National ID (FAYDA).
          </p>
        </div>
        <ApplicationForm dynamicCourses={courses} />
      </div>
      <Footer />
    </main>
  );
}
