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
} from "lucide-react";
import { Application, CmsCourse, CmsFaq, CmsSiteSettings, CmsStat, ContactMessage } from "@/types";
import { calculateAnalytics } from "@/lib/analytics-utils";
import { FinancialKpiCard } from "./analytics/FinancialKpiCard";
import { AnalyticsCharts } from "./analytics/AnalyticsCharts";
import { ApplicationsDashboardClient } from "./ApplicationsDashboardClient";
import { CourseManagerClient } from "./cms/CourseManagerClient";
import { StatsManagerClient } from "./cms/StatsManagerClient";
import { FaqManagerClient } from "./cms/FaqManagerClient";
import { SiteSettingsClient } from "./cms/SiteSettingsClient";
import { InquiriesClient } from "./cms/InquiriesClient";
import { supabase } from "@/lib/supabase/client";

interface AdminDashboardHubProps {
  initialApplications: Application[];
  initialCourses: CmsCourse[];
  initialStats: CmsStat[];
  initialFaqs: CmsFaq[];
  initialSettings: CmsSiteSettings;
  initialMessages: ContactMessage[];
}

type TabType = "analytics" | "applications" | "courses" | "stats" | "faqs" | "settings" | "inquiries";

export function AdminDashboardHub({
  initialApplications,
  initialCourses,
  initialStats,
  initialFaqs,
  initialSettings,
  initialMessages,
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
      badge: initialApplications.filter((a) => a.status === "under_review").length || undefined,
    },
    { id: "courses", label: "Programs & Courses", icon: <BookOpen className="w-4 h-4" />, badge: initialCourses.length },
    { id: "stats", label: "Homepage Stats", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "faqs", label: "FAQ Editor", icon: <HelpCircle className="w-4 h-4" /> },
    { id: "settings", label: "Banking & Settings", icon: <Settings className="w-4 h-4" /> },
    {
      id: "inquiries",
      label: "Contact Inquiries",
      icon: <Mail className="w-4 h-4" />,
      badge: initialMessages.length > 0 ? initialMessages.length : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
            AE
          </div>
          <span className="font-black text-slate-900 text-sm">Academic Excellence</span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between p-5 transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Brand header in sidebar */}
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <GraduationCap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-slate-900 leading-tight">
                Academic Excellence
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 block">
                Command Center
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isActive ? "text-white" : "text-slate-400"}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
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
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Public Portal</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">
        {/* Render Active Tab */}
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
      </main>
    </div>
  );
}
