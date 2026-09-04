"use client";

import React from "react";
import {
  FileCheck, CreditCard, CheckCircle2, XCircle, Ban,
  Clock, MessageSquare, Edit
} from "lucide-react";
import type { ApplicationEvent } from "@/types";

const EVENT_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  submitted: { icon: FileCheck, color: "text-blue-600", bg: "bg-blue-50", label: "Application Submitted" },
  payment_uploaded: { icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50", label: "Payment Proof Uploaded" },
  status_changed: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", label: "Status Changed" },
  note_added: { icon: MessageSquare, color: "text-indigo-600", bg: "bg-indigo-50", label: "Note Added" },
  cancelled: { icon: Ban, color: "text-slate-600", bg: "bg-slate-50", label: "Application Cancelled" },
  rejected: { icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", label: "Application Rejected" },
};

function getEventConfig(type: string) {
  return EVENT_CONFIG[type] || { icon: Edit, color: "text-slate-500", bg: "bg-slate-50", label: type.replace(/_/g, " ") };
}

export function ApplicationTimeline({ events }: { events: ApplicationEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        <Clock className="w-6 h-6 mx-auto mb-2" />
        No timeline events recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event, idx) => {
        const config = getEventConfig(event.event_type);
        const Icon = config.icon;
        const isLast = idx === events.length - 1;

        return (
          <div key={event.id} className="flex gap-4">
            {/* Line + Icon */}
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full ${config.bg} border border-slate-100 flex items-center justify-center shadow-sm`}>
                <Icon className={`w-4.5 h-4.5 ${config.color}`} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-slate-200 min-h-[24px]" />}
            </div>

            {/* Content */}
            <div className="pb-5 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{config.label}</p>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(event.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Value changes */}
              {(event.old_value || event.new_value) && (
                <div className="flex items-center gap-1.5 mt-1">
                  {event.old_value && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 line-through">
                      {event.old_value}
                    </span>
                  )}
                  {event.old_value && event.new_value && (
                    <span className="text-slate-300">→</span>
                  )}
                  {event.new_value && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                      {event.new_value}
                    </span>
                  )}
                </div>
              )}

              {/* Actor */}
              <p className="text-[10px] text-slate-400 mt-1">
                by {event.actor === "system" ? "System" : event.actor === "applicant" ? "Applicant" : event.actor}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
