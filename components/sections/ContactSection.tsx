"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mail, Send, CheckCircle2, AlertCircle, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { siteConfig } from "@/lib/content";
import { submitContactMessageAction } from "@/app/actions/application-actions";
import { useTranslation } from "@/lib/i18n/context";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ContactSection() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (leftColRef.current && rightColRef.current) {
      gsap.fromTo(
        leftColRef.current,
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: leftColRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        rightColRef.current,
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: rightColRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("message", message);

    const res = await submitContactMessageAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setSuccess(true);
      setEmail("");
      setMessage("");
    } else {
      setError(res.error || "Failed to send message.");
    }
  };

  return (
    <section id="contact-us" className="py-20 relative bg-white border-t border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 block">
            {t.contact.sectionLabel}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{t.contact.title}</h2>
          <p className="mt-2 text-slate-600 text-xs sm:text-sm max-w-lg mx-auto">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Contact Details Info */}
          <div ref={leftColRef} className="lg:col-span-5 flex">
            <div className="p-7 rounded-2xl bg-blue-50/80 border border-blue-100 space-y-5 w-full flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t.contact.hubTitle}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  {t.contact.hubDesc}
                </p>
              </div>
              
              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">{siteConfig.contactEmail}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">{siteConfig.phone}</span>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="leading-snug font-medium">{siteConfig.address}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-blue-200/60 text-[11px] text-blue-900 font-semibold">
                {t.contact.officeHours}
              </div>
            </div>
          </div>

          {/* Form */}
          <div ref={rightColRef} className="lg:col-span-7">
            <Card className="p-8 bg-white border-slate-200 shadow-md h-full flex flex-col justify-center">
              {success ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{t.contact.successTitle}</h3>
                  <p className="text-xs text-slate-600">
                    {t.contact.successDesc}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSuccess(false)}>
                    {t.contact.sendAnother}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center text-rose-700 text-xs">
                      <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-600" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {t.contact.emailLabel} <span className="text-blue-600">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.contact.emailPlaceholder}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {t.contact.messageLabel} <span className="text-blue-600">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t.contact.messagePlaceholder}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm resize-none shadow-sm"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full justify-center py-3 font-semibold shadow-md shadow-blue-600/20" isLoading={isSubmitting}>
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? t.contact.submitting : t.contact.submitBtn}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
