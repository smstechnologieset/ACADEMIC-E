"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { processSteps } from "@/lib/content";
import { Card } from "@/components/ui/Card";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/context";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HowItWorks() {
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (stepsContainerRef.current) {
      const stepCards = stepsContainerRef.current.querySelectorAll(".step-card");
      gsap.fromTo(
        stepCards,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: stepsContainerRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }
  }, []);

  const stepsData = t.howItWorks.steps || processSteps;

  return (
    <section id="how-it-works" className="py-24 bg-white relative border-y border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 block">
            {t.howItWorks.sectionLabel}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t.howItWorks.title}
          </h2>
          <p className="mt-3 text-slate-600 text-sm leading-relaxed">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div ref={stepsContainerRef} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
          {processSteps.map((step, idx) => {
            const stepTitle = stepsData[idx]?.title || step.title;
            const stepDesc = stepsData[idx]?.description || step.description;

            return (
              <div key={step.step} className="step-card">
                <Card className="h-full flex flex-col p-6 relative group hover:border-blue-400 bg-slate-50/80 border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="text-3xl font-black text-blue-600 mb-3 font-mono">
                    {step.step}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{stepTitle}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed flex-grow">{stepDesc}</p>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center text-[11px] font-bold text-blue-700">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>Step {idx + 1} of 5</span>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <Link href="/apply">
            <Button size="lg" className="group px-8 py-4 shadow-lg shadow-blue-600/20">
              <span>{t.nav.apply}</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
