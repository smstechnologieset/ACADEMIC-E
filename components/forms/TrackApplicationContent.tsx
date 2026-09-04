"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search, ArrowLeft, CheckCircle2, Clock, FileCheck, XCircle,
  Ban, AlertTriangle, CreditCard, ChevronDown, ChevronUp,
  GraduationCap, Mail
} from "lucide-react";
import { trackApplicationAction, cancelApplicationAction, TrackResult } from "@/app/actions/track-actions";
import { useTranslation } from "@/lib/i18n/context";
import type { ApplicationEvent } from "@/types";

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  under_review: { icon: FileCheck, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  approved: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  rejected: { icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
  cancelled: { icon: Ban, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
};

const STEP_ORDER = ["pending", "under_review", "approved"];

function StatusStepper({ currentStatus }: { currentStatus: string }) {
  const { t } = useTranslation();
  const labels = [
    t.track.status.pending,
    t.track.status.under_review,
    t.track.status.approved,
  ];

  if (currentStatus === "rejected" || currentStatus === "cancelled") {
    const cfg = STATUS_CONFIG[currentStatus];
    const Icon = cfg.icon;
    return (
      <div className={`flex items-center justify-center gap-3 p-4 rounded-xl ${cfg.bg} ${cfg.border} border`}>
        <Icon className={`w-6 h-6 ${cfg.color}`} />
        <span className={`font-bold ${cfg.color}`}>
          {currentStatus === "rejected" ? t.track.status.rejected : t.track.status.cancelled}
        </span>
      </div>
    );
  }

  const currentIdx = STEP_ORDER.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {STEP_ORDER.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isPending = idx > currentIdx;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${isCompleted ? "bg-emerald-500 text-white" : ""}
                  ${isCurrent ? "bg-blue-600 text-white ring-4 ring-blue-100" : ""}
                  ${isPending ? "bg-slate-100 text-slate-400 border border-slate-200" : ""}
                `}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={`text-[10px] sm:text-xs font-medium text-center leading-tight
                ${isCurrent ? "text-blue-700 font-bold" : isCompleted ? "text-emerald-600" : "text-slate-400"}
              `}>
                {labels[idx]}
              </span>
            </div>
            {idx < STEP_ORDER.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full mt-[-20px] ${idx < currentIdx ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function EventIcon({ type }: { type: string }) {
  switch (type) {
    case "submitted": return <FileCheck className="w-4 h-4 text-blue-500" />;
    case "payment_uploaded": return <CreditCard className="w-4 h-4 text-amber-500" />;
    case "status_changed": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case "cancelled": return <Ban className="w-4 h-4 text-slate-500" />;
    default: return <Clock className="w-4 h-4 text-slate-400" />;
  }
}

function Timeline({ events }: { events: ApplicationEvent[] }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const visibleEvents = expanded ? events : events.slice(0, 3);

  return (
    <div className="mt-6">
      <h3 className="text-sm font-bold text-slate-700 mb-3">{t.track.timeline}</h3>
      <div className="space-y-0">
        {visibleEvents.map((event, idx) => (
          <div key={event.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                <EventIcon type={event.event_type} />
              </div>
              {idx < visibleEvents.length - 1 && (
                <div className="w-px h-6 bg-slate-200" />
              )}
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium text-slate-800 capitalize">
                {event.event_type.replace(/_/g, " ")}
              </p>
              {event.new_value && (
                <p className="text-xs text-slate-500">
                  {event.old_value && <span>{event.old_value} → </span>}
                  <span className="font-medium text-slate-700">{event.new_value}</span>
                </p>
              )}
              <p className="text-[10px] text-slate-400 mt-0.5">
                {new Date(event.created_at).toLocaleString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
                {event.actor !== "system" && ` • by ${event.actor}`}
              </p>
            </div>
          </div>
        ))}
      </div>
      {events.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
        >
          {expanded ? <>Show less <ChevronUp className="w-3 h-3" /></> : <>Show all ({events.length}) <ChevronDown className="w-3 h-3" /></>}
        </button>
      )}
    </div>
  );
}

export function TrackApplicationContent() {
  const { t } = useTranslation();
  const [refId, setRefId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [searched, setSearched] = useState(false);

  // Cancel state
  const [showCancel, setShowCancel] = useState(false);
  const [cancelEmail, setCancelEmail] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refId.trim()) return;
    setLoading(true);
    setSearched(true);
    setCancelSuccess(false);
    setShowCancel(false);

    const res = await trackApplicationAction(refId.trim());
    setResult(res);
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!cancelEmail.trim() || !result?.id) return;
    setCancelLoading(true);
    setCancelError(null);

    const res = await cancelApplicationAction(result.id, cancelEmail.trim());
    if (res.success) {
      setCancelSuccess(true);
      setShowCancel(false);
      try {
        localStorage.removeItem("ae_pending_payment_ref");
      } catch {}
      // Refresh
      const updated = await trackApplicationAction(result.id);
      setResult(updated);
    } else {
      setCancelError(res.error || "Failed to cancel.");
    }
    setCancelLoading(false);
  };

  const canCancel = result?.status === "pending" || result?.status === "under_review";
  const statusCfg = result?.status ? STATUS_CONFIG[result.status] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-5">
            <GraduationCap className="w-8 h-8 text-blue-300" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{t.track.title}</h1>
          <p className="text-blue-200 mt-3 text-sm">{t.track.subtitle}</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-2xl mx-auto px-4 -mt-8">
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={refId}
                onChange={(e) => setRefId(e.target.value.toUpperCase())}
                placeholder={t.track.placeholder}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-mono tracking-wider transition-all"
                maxLength={12}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !refId.trim()}
              className="px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-600/20 whitespace-nowrap"
            >
              {loading ? t.track.searching : t.track.search}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500 mt-4">{t.track.searching}</p>
          </div>
        )}

        {!loading && searched && result && !result.found && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <p className="text-slate-600 text-sm">{t.track.notFound}</p>
          </div>
        )}

        {!loading && result?.found && statusCfg && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Status Header */}
            <div className={`p-6 ${statusCfg.bg} ${statusCfg.border} border-b`}>
              <StatusStepper currentStatus={result.status!} />
            </div>

            {/* Application Details */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference ID</p>
                  <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">{result.id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applicant</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{result.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Program</p>
                  <p className="text-sm text-slate-700 mt-0.5">{result.courseApplied}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submitted</p>
                  <p className="text-sm text-slate-700 mt-0.5">
                    {result.submissionDate ? new Date(result.submissionDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
                  </p>
                </div>
                {result.paymentMethod && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment</p>
                    <p className="text-sm text-slate-700 mt-0.5">{result.paymentMethod}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Updated</p>
                  <p className="text-sm text-slate-700 mt-0.5">
                    {result.updatedAt ? new Date(result.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              {result.events && result.events.length > 0 && (
                <Timeline events={result.events} />
              )}

              {/* Cancel Application */}
              {canCancel && !cancelSuccess && (
                <div className="pt-4 border-t border-slate-100">
                  {!showCancel ? (
                    <button
                      onClick={() => setShowCancel(true)}
                      className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Ban className="w-4 h-4" /> {t.track.cancel}
                    </button>
                  ) : (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3">
                      <p className="text-sm text-rose-700 font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> {t.track.cancelConfirm}
                      </p>
                      <div>
                        <label className="text-xs font-medium text-slate-600 mb-1 block">
                          <Mail className="w-3.5 h-3.5 inline mr-1" />{t.track.cancelEmailLabel}
                        </label>
                        <input
                          type="email"
                          value={cancelEmail}
                          onChange={(e) => setCancelEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full px-3 py-2 rounded-lg border border-rose-200 text-sm focus:outline-none focus:border-rose-400 bg-white"
                        />
                      </div>
                      {cancelError && (
                        <p className="text-xs text-rose-600">{cancelError}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancel}
                          disabled={cancelLoading || !cancelEmail.trim()}
                          className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 disabled:opacity-50 transition-colors"
                        >
                          {cancelLoading ? "Cancelling..." : t.common.confirm}
                        </button>
                        <button
                          onClick={() => { setShowCancel(false); setCancelError(null); }}
                          className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors"
                        >
                          {t.common.back}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {cancelSuccess && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <Ban className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">{t.track.cancelSuccess}</p>
                </div>
              )}

              {/* Approved Message */}
              {result.status === "approved" && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-emerald-700">🎉 Congratulations! Your application has been approved.</p>
                  <p className="text-xs text-emerald-600 mt-1">Our academic advisors will contact you shortly with enrollment details.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
