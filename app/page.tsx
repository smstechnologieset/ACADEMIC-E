import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { About } from "@/components/sections/About";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Faq } from "@/components/sections/Faq";
import { ContactSection } from "@/components/sections/ContactSection";
import { Footer } from "@/components/ui/Footer";
import { getCmsStats, getCmsCourses, getCmsFaqs, getCmsSiteSettings } from "@/lib/cms-repo";

export default async function Home() {
  const [stats, courses, faqs, settings] = await Promise.all([
    getCmsStats(),
    getCmsCourses(),
    getCmsFaqs(),
    getCmsSiteSettings(),
  ]);

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <Navbar />
      <Hero />
      <Stats stats={stats} />
      <About courses={courses} settings={settings} />
      <HowItWorks />
      <Faq faqs={faqs} />
      <ContactSection />
      <Footer />
    </main>
  );
}
