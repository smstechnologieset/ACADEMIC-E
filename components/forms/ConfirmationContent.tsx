"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, Mail, FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import confetti from "canvas-confetti";

export function ConfirmationContent() {
  const searchParams = useSearchParams();
  const refId = searchParams.get("ref") || "";

  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#2563eb", "#3b82f6", "#0ea5e9", "#10b981"],
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="text-center p-8 sm:p-12 bg-white border-slate-200 shadow-xl relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 mb-6 shadow-sm">
          <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block mb-1">
          Dossier Registered
        </span>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Application Successfully Received!</h2>
        <p className="mt-3 text-slate-600 text-sm leading-relaxed max-w-lg mx-auto">
          Thank you for applying to Academic Excellence. Your FAYDA identity documentation and payment slip have been
          registered in our admissions review registry.
        </p>

        {refId && (
          <div className="my-8 p-4 rounded-2xl bg-blue-50 border border-blue-200 inline-block text-center shadow-sm">
            <span className="text-xs text-blue-800 block font-bold uppercase tracking-wider">
              Application Reference Number
            </span>
            <span className="font-mono text-xl font-black text-blue-700 tracking-widest mt-1 block">
              {refId}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 text-left">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">48-Hour Review</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                Admissions board inspects credentials within 48 to 72 hours.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
            <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">Email Decision</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                You will receive your formal decision and Percipio login instructions by email.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
            <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">FAYDA Secured</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                Your submitted identity documents are stored under encrypted access.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2 text-blue-600" />
              Return to Homepage
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
