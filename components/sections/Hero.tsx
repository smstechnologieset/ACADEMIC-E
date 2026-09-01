"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  Award,
  BookOpen,
  Cpu,
  Globe2,
  Users,
  Search,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { siteConfig, availableCourses } from "@/lib/content";

export function Hero() {
  const cardRef = useRef<HTMLDivElement>(null);
  const floatingBadgeRef = useRef<HTMLDivElement>(null);
  const glowOrbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP floating animation for hero interactive showcase card
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: -10,
        rotation: 0.5,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }

    if (floatingBadgeRef.current) {
      gsap.to(floatingBadgeRef.current, {
        y: 8,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    if (glowOrbRef.current) {
      gsap.to(glowOrbRef.current, {
        scale: 1.15,
        opacity: 0.8,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });
    }
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-32 pb-20 overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-white">
      {/* Background ambient lighting and mesh */}
      <div ref={glowOrbRef} className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-blue-200/50 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-sky-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 light-grid-pattern opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Top institutional pill badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-bold text-blue-700 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Transforming Education for Ethiopian Learners & Professionals</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]"
            >
              Unlock Globally Recognized{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600">
                Education & Job-Ready Skills
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed"
            >
              Equitable access to subsidized US-aligned higher education, 10,000+ specialized courses,
              and industry certifications delivered via <strong>Skillsoft Percipio</strong> in collaboration
              with <strong>N</strong>, <strong>RI</strong>, and the <strong>University in New York</strong>.
            </motion.p>

            {/* Interactive CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
            >
              <Link href="/apply">
                <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-base font-semibold group shadow-lg shadow-blue-600/25">
                  <span>Start Online Application</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/#courses">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-7 py-4 text-base font-semibold">
                  <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                  Explore 120+ Programs
                </Button>
              </Link>
            </motion.div>

            {/* Institutional Trust markers */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 font-medium"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>FAYDA ID Verified Access</span>
              </div>
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Univ. in NY Associated Credentials</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Subsidized Tuition in ETB</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive Live Showcase Card with GSAP Micro-motion */}
          <div className="lg:col-span-5 relative">
            {/* Top floating badge */}
            <div
              ref={floatingBadgeRef}
              className="absolute -top-5 -right-3 sm:-right-4 z-20 px-3.5 py-2 rounded-xl bg-white border border-blue-200 shadow-lg text-xs font-bold text-blue-900 flex items-center space-x-2"
            >
              <Award className="w-4 h-4 text-blue-600" />
              <span>90%+ GPA = Merit Badge Award</span>
            </div>

            {/* Main Interactive Showcase Card */}
            <div
              ref={cardRef}
              className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-blue-900/5 relative overflow-hidden"
            >
              {/* Header inside card */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                    AE
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Academic Excellence</h4>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 block">
                      Skillsoft Percipio Portal
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  Intake Open
                </span>
              </div>

              {/* Sample featured course badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-800 uppercase tracking-wider text-[10px]">
                    Featured Job-Ready Track
                  </span>
                  <span className="text-slate-500 font-semibold">24 Weeks • Self-Paced</span>
                </div>
                <div className="text-base font-extrabold text-slate-900">
                  Artificial Intelligence & Generative AI (AI/GAI)
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-700">
                    Machine Learning
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-700">
                    Deep Learning
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-700">
                    Industry Capstone
                  </span>
                </div>
              </div>

              {/* Stats highlights inside card */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-lg font-black text-slate-900">10,000+</div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Learning Modules</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-lg font-black text-blue-600">120+</div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Diplomas & Certs</div>
                </div>
              </div>

              {/* Live Card Action */}
              <Link href="/apply" className="block">
                <Button className="w-full justify-center text-sm py-3 font-semibold shadow-md shadow-blue-600/20">
                  <span>Apply Now </span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
  
}
