import type { Metadata } from "next";
import { siteConfig } from "@/lib/content";
import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { About } from "@/components/sections/About";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { ContactSection } from "@/components/sections/ContactSection";
import { Footer } from "@/components/ui/Footer";
import {
  getCmsStats,
  getCmsCourses,
  getCmsFaqs,
  getCmsSiteSettings,
  getCmsTestimonials,
} from "@/lib/cms-repo";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default async function Home() {
  const [stats, courses, faqs, settings, testimonials] = await Promise.all([
    getCmsStats(),
    getCmsCourses(),
    getCmsFaqs(),
    getCmsSiteSettings(),
    getCmsTestimonials(),
  ]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": (faqs && faqs.length > 0 ? faqs : []).map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {faqs && faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <Navbar />
      <Hero />
      <Stats stats={stats} />
      <About courses={courses} settings={settings} />
      <HowItWorks />
      <Testimonials testimonials={testimonials} />
      <Faq faqs={faqs} />
      <ContactSection />
      <Footer />
    </main>
  );
}
