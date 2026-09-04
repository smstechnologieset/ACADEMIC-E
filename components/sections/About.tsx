"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Target,
  Eye,
  HeartHandshake,
  Award,
  ArrowRight,
  Search,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { siteConfig, focusPillars } from "@/lib/content";
import { CmsCourse, CmsSiteSettings } from "@/types";
import { useTranslation } from "@/lib/i18n/context";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface AboutProps {
  courses?: CmsCourse[];
  settings?: CmsSiteSettings;
}

export function About({ courses, settings }: AboutProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"all" | "job-ready" | "pgd">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const visionCardsRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);
  const coursesContainerRef = useRef<HTMLDivElement>(null);

  const activeSettings = settings || siteConfig;

  const defaultJobReady: CmsCourse[] = [
    { id: "c1", title: "Artificial Intelligence (AI)", duration: "24 Weeks", level: "Certificate / Diploma", category: "job-ready", status: "Active", is_featured: true, sort_order: 1 },
    { id: "c2", title: "Data Science and Big Data", duration: "24 Weeks", level: "Certificate / Diploma", category: "job-ready", status: "Active", is_featured: true, sort_order: 2 },
    { id: "c3", title: "Cybersecurity and Ethical Hacking", duration: "24 Weeks", level: "Certificate / Diploma", category: "job-ready", status: "Active", is_featured: false, sort_order: 3 },
    { id: "c4", title: "Cloud Computing (AWS & Azure)", duration: "24 Weeks", level: "Certificate / Diploma", category: "job-ready", status: "Active", is_featured: false, sort_order: 4 },
    { id: "c5", title: "Machine Learning Engineering", duration: "24 Weeks", level: "Certificate / Diploma", category: "job-ready", status: "Active", is_featured: false, sort_order: 5 },
    { id: "c6", title: "Project Management Professional", duration: "24 Weeks", level: "Professional Track", category: "job-ready", status: "Active", is_featured: false, sort_order: 6 },
    { id: "c7", title: "Product Management Essentials", duration: "24 Weeks", level: "Professional Track", category: "job-ready", status: "Active", is_featured: false, sort_order: 7 },
    { id: "c8", title: "Business & Leadership Skills", duration: "24 Weeks", level: "Leadership Track", category: "job-ready", status: "Active", is_featured: false, sort_order: 8 },
    { id: "c9", title: "Communication & Productivity Skills", duration: "24 Weeks", level: "Productivity Track", category: "job-ready", status: "Active", is_featured: false, sort_order: 9 },
    { id: "c10", title: "Professional IT Certifications", duration: "24 Weeks", level: "Industry Credential", category: "job-ready", status: "Active", is_featured: false, sort_order: 10 },
    { id: "c11", title: "Business Analytics & Strategy", duration: "24 Weeks", level: "Executive Track", category: "job-ready", status: "Active", is_featured: false, sort_order: 11 },
    { id: "c12", title: "Digital Marketing & Transformation", duration: "24 Weeks", level: "Digital Growth", category: "job-ready", status: "Active", is_featured: false, sort_order: 12 },
  ];

  const defaultPgd: CmsCourse[] = [
    {
      id: "c13",
      title: "Postgraduate Diploma in Management",
      duration: "12 Months (80+ hrs/course)",
      level: "Postgraduate Diploma",
      category: "pgd",
      specialization: "6 Core Courses + 2 Soft-Skill Tracks + Business Simulation Game",
      status: "Coming Soon",
      is_featured: true,
      sort_order: 13,
    },
    {
      id: "c14",
      title: "Postgraduate Diploma in Information Technology",
      duration: "12 Months (80+ hrs/course)",
      level: "Postgraduate Diploma",
      category: "pgd",
      specialization: "Cybersecurity, Cloud, Machine Learning, Python, Big Data, Blockchain",
      status: "Coming Soon",
      is_featured: true,
      sort_order: 14,
    },
    {
      id: "c15",
      title: "Postgraduate Diploma in Artificial Intelligence & Generative AI",
      duration: "12 Months (80+ hrs/course)",
      level: "Postgraduate Diploma",
      category: "pgd",
      specialization: "Deep Learning, LLMs, Neural Networks, AI Strategy & Ethics",
      status: "Coming Soon",
      is_featured: true,
      sort_order: 15,
    },
  ];

  const allCourses = courses && courses.length > 0 ? courses : [...defaultJobReady, ...defaultPgd];

  const jobReadyCourses = allCourses.filter((c) => c.category === "job-ready" || c.category === "tech" || c.category === "business");
  const pgdCourses = allCourses.filter((c) => c.category === "pgd");

  const filteredJobReady = jobReadyCourses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPgd = pgdCourses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // 1. GSAP ScrollTrigger for Vision, Mission, Motto Cards (Rising from the bottom)
    if (visionCardsRef.current) {
      const cards = visionCardsRef.current.children;
      gsap.fromTo(
        cards,
        { y: 110, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          stagger: 0.22,
          ease: "power3.out",
          scrollTrigger: {
            trigger: visionCardsRef.current,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // 2. GSAP ScrollTrigger for 5 Pillars + Merit Badge (Pop & scale with stagger)
    if (pillarsRef.current) {
      const pillarItems = pillarsRef.current.querySelectorAll(".pillar-item");
      gsap.fromTo(
        pillarItems,
        { scale: 0.78, y: 35, opacity: 0 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "back.out(1.6)",
          scrollTrigger: {
            trigger: pillarsRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }
  }, []);

  // 3. GSAP Animation on Course Cards when tab / search changes
  useEffect(() => {
    if (coursesContainerRef.current) {
      const courseCards = coursesContainerRef.current.querySelectorAll(".course-card");
      gsap.fromTo(
        courseCards,
        { opacity: 0, y: 35, rotateX: 10 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.55,
          stagger: 0.06,
          ease: "power2.out",
        }
      );
    }
  }, [activeTab, searchQuery, courses]);

  return (
    <section id="about" className="py-24 relative bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* Section 1: About & Institutional Purpose */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 block">
              {t.about.sectionLabel}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              &ldquo;{t.about.title}&rdquo;
            </h2>
            <p className="mt-3 text-blue-900 font-semibold text-base sm:text-lg">
              {activeSettings.subheading || t.about.subheading || siteConfig.subheading}
            </p>
            <p className="mt-4 text-slate-600 text-sm leading-relaxed">
              {t.about.description}
            </p>
          </div>

          {/* Vision, Mission, Motto Cards (GSAP ScrollTriggered from the bottom) */}
          <div ref={visionCardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-7 space-y-3 bg-white border-slate-200 shadow-md hover:shadow-xl hover:border-blue-300 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shadow-sm">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t.about.visionTitle}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.about.visionDesc}
              </p>
            </Card>

            <Card className="p-7 space-y-3 bg-white border-slate-200 shadow-md hover:shadow-xl hover:border-blue-300 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shadow-sm">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t.about.missionTitle}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.about.missionDesc}
              </p>
            </Card>

            <Card className="p-7 space-y-3 bg-white border-slate-200 shadow-md hover:shadow-xl hover:border-blue-300 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shadow-sm">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t.about.mottoTitle}</h3>
              <p className="text-sm font-bold text-blue-700 italic">
                &ldquo;{activeSettings.motto || t.about.mottoDesc || siteConfig.motto}&rdquo;
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.about.mottoDesc}
              </p>
            </Card>
          </div>
        </div>

        {/* Section 2: 5 Focus Pillars */}
        <div ref={pillarsRef} className="rounded-3xl p-8 sm:p-12 bg-white border border-slate-200 shadow-md">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 block">
              {t.about.empowerLabel}
            </span>
            <h3 className="text-2xl font-bold text-slate-900">{t.about.empowerTitle}</h3>
            <p className="text-xs text-slate-600 mt-2">
              {t.about.empowerSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(t.about.pillars || focusPillars).map((pillar, idx) => (
              <div
                key={idx}
                className="pillar-item p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center space-x-3 text-xs font-semibold text-slate-800 hover:border-blue-400 hover:bg-blue-50/60 transition-all shadow-sm hover:scale-[1.02]"
              >
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm shadow-blue-600/30">
                  {idx + 1}
                </span>
                <span>{pillar}</span>
              </div>
            ))}
            <div className="pillar-item p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center space-x-3 text-xs font-bold text-blue-800 shadow-sm hover:scale-[1.02] transition-transform">
              <Award className="w-6 h-6 text-blue-700 shrink-0" />
              <span>{t.about.meritBadge}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Interactive Tabbed Course Explorer */}
        <div id="courses" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1 block">
                {t.about.curriculumLabel}
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {t.about.curriculumTitle} ({allCourses.length})
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                {t.about.curriculumSubtitle}
              </p>
            </div>

            {/* Search Input inside Explorer */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.about.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Interactive Tab Switcher */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "all"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-[1.02]"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {t.about.tabAll} ({filteredJobReady.length + filteredPgd.length})
            </button>
            <button
              onClick={() => setActiveTab("job-ready")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "job-ready"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-[1.02]"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {t.about.tabJobReady} ({jobReadyCourses.length})
            </button>
            <button
              onClick={() => setActiveTab("pgd")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "pgd"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-[1.02]"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {t.about.tabPgd} ({pgdCourses.length})
            </button>
          </div>

          {/* Courses Grid with GSAP Animation Container */}
          <div ref={coursesContainerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: "1000px" }}>
            {(activeTab === "all" || activeTab === "job-ready") &&
              filteredJobReady.map((course) => {
                const courseSlug = course.slug || course.title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
                return (
                  <Card key={course.id} className="course-card p-6 flex flex-col justify-between hover:border-blue-400 bg-white shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-3">
                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {course.duration}
                        </span>
                        <span className="font-semibold text-slate-500">{course.level}</span>
                      </div>
                      <Link href={`/courses/${courseSlug}`}>
                        <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {course.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {course.description || course.specialization || "Industry-aligned curriculum with interactive labs, assessments, and globally recognized credentials."}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/courses/${courseSlug}`}
                        className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        {t.about.cardDetails}
                      </Link>
                      <Link
                        href={`/apply?course=${encodeURIComponent(course.title)}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <span>{t.about.cardApply}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </Card>
                );
              })}

            {(activeTab === "all" || activeTab === "pgd") &&
              filteredPgd.map((pgd) => {
                const pgdSlug = pgd.slug || pgd.title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
                return (
                  <Card key={pgd.id} className="course-card p-6 flex flex-col justify-between border-blue-200 bg-gradient-to-br from-white to-blue-50/40 shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-3">
                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-600 text-white shadow-sm">
                          {pgd.status}
                        </span>
                        <span className="font-bold text-blue-900">{pgd.duration}</span>
                      </div>
                      <Link href={`/courses/${pgdSlug}`}>
                        <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {pgd.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-2">
                        {pgd.description || pgd.specialization}
                      </p>
                      <div className="p-2.5 rounded-xl bg-white border border-blue-100 text-[11px] text-slate-600 font-medium shadow-sm">
                        {t.about.cardSimulation}
                      </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-blue-100 flex items-center justify-between">
                      <Link
                        href={`/courses/${pgdSlug}`}
                        className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        {t.about.cardCurriculum}
                      </Link>
                      <Link
                        href={`/apply?course=${encodeURIComponent(pgd.title)}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <span>{t.about.cardPreRegister}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
}
