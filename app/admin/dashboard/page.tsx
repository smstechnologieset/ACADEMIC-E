import { Metadata } from "next";
import { getApplications } from "@/lib/applications-repo";
import {
  getCmsCourses,
  getCmsStats,
  getCmsFaqs,
  getCmsSiteSettings,
  getContactMessages,
  getCmsTestimonials,
} from "@/lib/cms-repo";
import { AdminDashboardHub } from "@/components/admin/AdminDashboardHub";

export const metadata: Metadata = {
  title: "Admin Command Center",
  description: "Analytics, admissions dossiers, and site CMS for Academic Excellence.",
};

export default async function AdminDashboardPage() {
  const [applications, courses, stats, faqs, settings, messages, testimonials] =
    await Promise.all([
      getApplications(),
      getCmsCourses(),
      getCmsStats(),
      getCmsFaqs(),
      getCmsSiteSettings(),
      getContactMessages(),
      getCmsTestimonials(),
    ]);

  return (
    <AdminDashboardHub
      initialApplications={applications}
      initialCourses={courses}
      initialStats={stats}
      initialFaqs={faqs}
      initialSettings={settings}
      initialMessages={messages}
      initialTestimonials={testimonials}
    />
  );
}
