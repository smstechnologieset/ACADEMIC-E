import { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { getCmsCourses } from "@/lib/cms-repo";

export const metadata: Metadata = {
  title: "Online Application Intake",
  description: "Complete your Academic Excellence application dossier with Ethiopian FAYDA ID verification.",
};

export default async function ApplyPage() {
  const courses = await getCmsCourses();

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
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
