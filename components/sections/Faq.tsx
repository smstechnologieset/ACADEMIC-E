"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown, HelpCircle } from "lucide-react";
import { faqs as defaultFaqs } from "@/lib/content";
import { CmsFaq } from "@/types";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface FaqProps {
  faqs?: CmsFaq[];
}

export function Faq({ faqs }: FaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqListRef = useRef<HTMLDivElement>(null);

  const displayFaqs = faqs && faqs.length > 0 ? faqs : defaultFaqs;

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  useEffect(() => {
    if (faqListRef.current) {
      const items = faqListRef.current.querySelectorAll(".faq-item");
      gsap.fromTo(
        items,
        { opacity: 0, x: -25 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: faqListRef.current,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );
    }
  }, [faqs]);

  return (
    <section id="faq" className="py-24 relative bg-slate-50 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>Common Inquiries</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-slate-600 text-sm">
            Everything you need to know about the admissions, FAYDA validation, and Skillsoft Percipio access.
          </p>
        </div>

        <div ref={faqListRef} className="space-y-3.5">
          {displayFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={cn(
                  "faq-item rounded-2xl transition-all duration-200 border bg-white shadow-sm overflow-hidden",
                  isOpen
                    ? "border-blue-300 ring-2 ring-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full py-5 px-6 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300",
                      isOpen && "rotate-180 text-blue-600"
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
