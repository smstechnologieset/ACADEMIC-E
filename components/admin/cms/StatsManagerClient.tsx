"use client";

import React, { useState } from "react";
import { CmsStat } from "@/types";
import { Award, CheckCircle2, Save, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { updateStatMetricAction } from "@/app/actions/cms-actions";

interface StatsManagerProps {
  initialStats: CmsStat[];
}

export function StatsManagerClient({ initialStats }: StatsManagerProps) {
  const [stats, setStats] = useState<CmsStat[]>(initialStats);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleFieldChange = (id: string, field: keyof CmsStat, value: any) => {
    setStats(stats.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleSaveStat = async (stat: CmsStat) => {
    setSavingId(stat.id);
    const res = await updateStatMetricAction(stat.id, stat);
    setSavingId(null);

    if (res.success) {
      setNotification(`Metric "${stat.label}" updated.`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-black text-slate-900 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Homepage Stats & Metric Counters
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Edit the 4 primary key performance figures displayed in the animated stats bar across the homepage.
        </p>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center text-emerald-800 text-xs shadow-sm">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat) => (
          <Card key={stat.id} className="p-6 bg-white border-slate-200 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-black uppercase text-blue-700 font-mono">
                Metric Key: {stat.stat_key}
              </span>
              <Button
                size="sm"
                onClick={() => handleSaveStat(stat)}
                isLoading={savingId === stat.id}
                className="shadow-sm"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                Save Changes
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Numeric Value *</label>
                <input
                  type="number"
                  value={stat.value}
                  onChange={(e) => handleFieldChange(stat.id, "value", parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-black text-base focus:outline-none focus:border-blue-600 shadow-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Suffix (e.g. +, %+, Wks)</label>
                <input
                  type="text"
                  value={stat.suffix}
                  onChange={(e) => handleFieldChange(stat.id, "suffix", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold text-base focus:outline-none focus:border-blue-600 shadow-sm"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-700 uppercase mb-1">Display Label *</label>
              <input
                type="text"
                value={stat.label}
                onChange={(e) => handleFieldChange(stat.id, "label", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 shadow-sm"
              />
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-700 uppercase mb-1">Description Subtext</label>
              <textarea
                rows={2}
                value={stat.description}
                onChange={(e) => handleFieldChange(stat.id, "description", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600 resize-none shadow-sm"
              />
            </div>

            {/* Live Preview Box */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-800 uppercase">Live Preview:</span>
              <div className="text-right">
                <span className="text-xl font-black text-slate-900">
                  {stat.value}
                  <span className="text-blue-600">{stat.suffix}</span>
                </span>
                <div className="text-[10px] font-bold text-slate-600 uppercase">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
