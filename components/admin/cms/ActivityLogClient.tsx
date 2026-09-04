"use client";

import React, { useState, useEffect } from "react";
import {
  Activity, CheckCircle2, XCircle, Edit, Trash2, Plus,
  Settings, FileText, Filter, RefreshCw
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase/client";
import type { AdminActivityLogEntry } from "@/types";

const ACTION_ICONS: Record<string, React.ElementType> = {
  approved_application: CheckCircle2,
  rejected_application: XCircle,
  updated_course: Edit,
  created_course: Plus,
  deleted_course: Trash2,
  updated_faq: Edit,
  created_faq: Plus,
  deleted_faq: Trash2,
  updated_settings: Settings,
  updated_testimonial: Edit,
  created_testimonial: Plus,
  deleted_testimonial: Trash2,
};

const ACTION_COLORS: Record<string, string> = {
  approved_application: "text-emerald-600 bg-emerald-50",
  rejected_application: "text-rose-600 bg-rose-50",
  bulk_approved: "text-emerald-600 bg-emerald-50",
  bulk_rejected: "text-rose-600 bg-rose-50",
};

function getActionDisplay(action: string) {
  const Icon = ACTION_ICONS[action] || Activity;
  const color = ACTION_COLORS[action] || "text-blue-600 bg-blue-50";
  const label = action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return { Icon, color, label };
}

export function ActivityLogClient({ initialEntries = [] }: { initialEntries?: AdminActivityLogEntry[] }) {
  const [entries, setEntries] = useState<AdminActivityLogEntry[]>(initialEntries);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("admin_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (filter !== "all") {
        query = query.eq("target_type", filter);
      }

      const { data } = await query;
      if (data) setEntries(data as AdminActivityLogEntry[]);
    } catch (err) {
      console.error("Failed to fetch activity log:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (initialEntries.length === 0) {
      fetchEntries();
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [filter]);

  const targetTypes = ["all", "application", "course", "faq", "settings", "testimonial"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Activity Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Admin audit trail — who did what, when</p>
        </div>
        <button
          onClick={fetchEntries}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        {targetTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize
              ${filter === type ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-50 overflow-hidden">
        {entries.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            No activity recorded yet.
          </div>
        ) : (
          entries.map((entry) => {
            const { Icon, color, label } = getActionDisplay(entry.action);
            return (
              <div key={entry.id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{label}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-500">{entry.actor_email}</span>
                    {entry.target_id && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                        {entry.target_id.length > 16 ? entry.target_id.slice(0, 16) + "..." : entry.target_id}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                  {new Date(entry.created_at).toLocaleString("en-US", {
                    month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
