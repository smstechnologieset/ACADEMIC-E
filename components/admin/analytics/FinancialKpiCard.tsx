"use client";

import React from "react";
import { Coins, TrendingUp, AlertCircle, CheckCircle2, DollarSign, Wallet } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface FinancialKpiProps {
  totalRevenueEtb: number;
  pendingRevenueEtb: number;
  feePerApplicant: number;
  totalApplications: number;
  approvedCount: number;
  underReviewCount: number;
}

export function FinancialKpiCard({
  totalRevenueEtb,
  pendingRevenueEtb,
  feePerApplicant,
  totalApplications,
  approvedCount,
  underReviewCount,
}: FinancialKpiProps) {
  const collectionRate =
    totalApplications > 0
      ? Math.round(((approvedCount + underReviewCount) / totalApplications) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Primary Financial Metric */}
      <Card className="p-6 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white border-none shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
            Total Revenue Generated
          </span>
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-200">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-3xl sm:text-4xl font-black tracking-tight flex items-baseline">
            <span>ETB {totalRevenueEtb.toLocaleString()}</span>
          </div>
          <p className="text-xs text-blue-200/80 mt-1">
            Realized revenue from {approvedCount} approved applicant{approvedCount === 1 ? "" : "s"} ({feePerApplicant.toLocaleString()} ETB/applicant)
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-blue-100">
          <span>Admissions Approval Rate</span>
          <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full">{totalApplications > 0 ? Math.round((approvedCount / totalApplications) * 100) : 0}%</span>
        </div>
      </Card>

      {/* Pending Inflow */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Pending Verification Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-4">
            ETB {pendingRevenueEtb.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Potential intake awaiting bank deposit slip verification
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center text-xs text-amber-800 font-semibold mt-3">
          <AlertCircle className="w-4 h-4 mr-1 text-amber-600" />
          <span>Requires receipt confirmation</span>
        </div>
      </Card>

      {/* Subsidized Fee Config Summary */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Application Fee Tariff
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-4">
            ETB {feePerApplicant.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Subsidized processing rate per applicant dossier
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center text-xs text-emerald-700 font-semibold mt-3">
          <CheckCircle2 className="w-4 h-4 mr-1" />
          <span>Editable via Site Settings tab</span>
        </div>
      </Card>
    </div>
  );
}
