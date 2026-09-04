"use client";

import React from "react";
import { Star, Quote, Award, Sparkles } from "lucide-react";
import { CmsTestimonial } from "@/types";
import { useTranslation } from "@/lib/i18n/context";

export function Testimonials({ testimonials }: { testimonials: CmsTestimonial[] }) {
  const { t } = useTranslation();
  const featured = testimonials.filter((t) => t.is_featured);
  const items = featured.length > 0 ? featured : testimonials;

  if (items.length === 0) return null;

  return (
    <section className="py-20 bg-slate-100/70 border-t border-b border-slate-200/80 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 inline-flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            <Sparkles className="w-3.5 h-3.5" />
            {t.testimonials.sectionLabel}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t.testimonials.title}
          </h2>
          <p className="mt-3 text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            {t.testimonials.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 relative group"
            >
              <div>
                {/* Header with Quote Icon & Stars */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Quote className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Quote Text */}
                <p className="text-xs text-slate-600 leading-relaxed italic mb-4 line-clamp-5">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Student Metadata */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm font-bold text-slate-900 leading-snug">{item.name}</p>
                {item.role && (
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{item.role}</p>
                )}
                {item.course_completed && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    <Award className="w-3 h-3" />
                    {item.course_completed}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
