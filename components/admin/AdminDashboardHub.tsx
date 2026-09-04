"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  TrendingUp,
  HelpCircle,
  Settings,
  Mail,
  LogOut,
  ExternalLink,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  Quote,
  Activity,
} from "lucide-react";
import {
  Application,
  CmsCourse,
  CmsFaq,
  CmsSiteSettings,
  CmsStat,
  ContactMessage,
  CmsTestimonial,
} from "@/types";
import { calculateAnalytics } from "@/lib/analytics-utils";
import { FinancialKpiCard } from "./analytics/FinancialKpiCard";
import { AnalyticsCharts } from "./analytics/AnalyticsCharts";
import { ApplicationsDashboardClient } from "./ApplicationsDashboardClient";
import { CourseManagerClient } from "./cms/CourseManagerClient";
import { StatsManagerClient } from "./cms/StatsManagerClient";
import { FaqManagerClient } from "./cms/FaqManagerClient";
import { SiteSettingsClient } from "./cms/SiteSettingsClient";
import { InquiriesClient } from "./cms/InquiriesClient";
import { TestimonialsManagerClient } from "./cms/TestimonialsManagerClient";
import { ActivityLogClient } from "./cms/ActivityLogClient";
import { RealtimeListener } from "./RealtimeListener";
import { ToastProvider } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase/client";

interface AdminDashboardHubProps {
  initialApplications: Application[];
  initialCourses: CmsCourse[];
  initialStats: CmsStat[];
  initialFaqs: CmsFaq[];
  initialSettings: CmsSiteSettings;
  initialMessages: ContactMessage[];
  initialTestimonials?: CmsTestimonial[];
}

type TabType =
  | "analytics"
  | "applications"
  | "courses"
  | "stats"
  | "faqs"
  | "settings"
  | "inquiries"
  | "testimonials"
  | "activity";

export function AdminDashboardHub({
  initialApplications,
  initialCourses,
  initialStats,
  initialFaqs,
  initialSettings,
  initialMessages,
  initialTestimonials = [],
}: AdminDashboardHubProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("analytics");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<CmsSiteSettings>(initialSettings);

  const feeAmount =
    parseInt(settings.applicationFee?.replace(/[^0-9]/g, "") || "", 10) ||
    settings.feeNumeric ||
    3500;

  const analytics = calculateAnalytics(initialApplications, initialCourses, feeAmount);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    document.cookie = "academic_admin_session=; path=/; max-age=0";
    router.push("/admin/login");
  };

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: "analytics", label: "Analytics & Finance", icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: "applications",
      label: "Applications Intake",
      icon: <FileText className="w-4 h-4" />,
      badge: initialApplications.filter((a) => a.status === "under_review" || a.status === "pending").length || undefined,
    },
    { id: "courses", label: "Programs & Courses", icon: <BookOpen className="w-4 h-4" />, badge: initialCourses.length },
    { id: "stats", label: "Homepage Stats", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "faqs", label: "FAQ Editor", icon: <HelpCircle className="w-4 h-4" /> },
    { id: "testimonials", label: "Testimonials", icon: <Quote className="w-4 h-4" /> },
    { id: "settings", label: "Banking & Settings", icon: <Settings className="w-4 h-4" /> },
    {
      id: "inquiries",
      label: "Contact Inquiries",
      icon: <Mail className="w-4 h-4" />,
      badge: initialMessages.length > 0 ? initialMessages.length : undefined,
    },
    { id: "activity", label: "Activity Log", icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <ToastProvider>
      <RealtimeListener />
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        {/* Mobile Top Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              AE
            </div>
            <div>
              <span className="font-black text-sm text-slate-900 block leading-tight">Admin Portal</span>
              <span className="text-[10px] text-slate-400">Academic Excellence</span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={`
            fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-40 flex flex-col justify-between transition-transform duration-300
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div>
            {/* Brand Logo Header */}
            <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
                <GraduationCap className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-black text-slate-900 tracking-tight text-sm block">Academic E</span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Evaluator Hub
                </span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="p-3 space-y-1">
              <p className="px-3 pt-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Management Modules
              </p>
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={isActive ? "text-white" : "text-slate-400"}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-slate-100 space-y-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4 text-slate-400" />
                <span>View Public Site</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === "analytics" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                    Analytics & Financial Overview
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time admissions telemetry, Ethiopian Birr intake revenue, and curriculum trends.
                  </p>
                </div>
              </div>

              {/* Financial KPI */}
              <FinancialKpiCard
                totalRevenueEtb={analytics.totalRevenueEtb}
                pendingRevenueEtb={analytics.pendingRevenueEtb}
                feePerApplicant={analytics.feePerApplicant}
                totalApplications={analytics.totalApplications}
                approvedCount={analytics.approvedCount}
                underReviewCount={analytics.underReviewCount}
              />

              {/* Charts */}
              <AnalyticsCharts analytics={analytics} />
            </div>
          )}

          {activeTab === "applications" && (
            <div className="animate-in fade-in duration-200">
              <ApplicationsDashboardClient initialApplications={initialApplications} />
            </div>
          )}

          {activeTab === "courses" && (
            <div className="animate-in fade-in duration-200">
              <CourseManagerClient initialCourses={initialCourses} />
            </div>
          )}

          {activeTab === "stats" && (
            <div className="animate-in fade-in duration-200">
              <StatsManagerClient initialStats={initialStats} />
            </div>
          )}

          {activeTab === "faqs" && (
            <div className="animate-in fade-in duration-200">
              <FaqManagerClient initialFaqs={initialFaqs} />
            </div>
          )}

          {activeTab === "testimonials" && (
            <div className="animate-in fade-in duration-200">
              <TestimonialsManagerClient initialTestimonials={initialTestimonials} />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="animate-in fade-in duration-200">
              <SiteSettingsClient initialSettings={settings} onSettingsChange={setSettings} />
            </div>
          )}

          {activeTab === "inquiries" && (
            <div className="animate-in fade-in duration-200">
              <InquiriesClient initialMessages={initialMessages} />
            </div>
          )}

          {activeTab === "activity" && (
            <div className="animate-in fade-in duration-200">
              <ActivityLogClient />
            </div>
          )}
        </main>
      </div>
    </ToastProvider>
  );
}
