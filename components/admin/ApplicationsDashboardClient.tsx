"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  FileText,
  Eye,
  LogOut,
  GraduationCap,
  ExternalLink,
  Download,
  CheckCircle2,
  XCircle,
  X,
  CheckSquare,
  Square,
  Ban,
  AlertCircle,
} from "lucide-react";
import { Application, ApplicationStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { bulkUpdateApplicationStatus } from "@/app/actions/bulk-actions";

interface ApplicationsTableProps {
  initialApplications: Application[];
}

export function ApplicationsDashboardClient({ initialApplications }: ApplicationsTableProps) {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    document.cookie = "academic_admin_session=; path=/; max-age=0";
    router.push("/admin/login");
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.course_applied.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const countByStatus = (st: ApplicationStatus) => applications.filter((a) => a.status === st).length;

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredApps.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredApps.map((a) => a.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkAction = async (status: ApplicationStatus) => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    const label = status === "approved" ? "approve" : "reject";
    if (!confirm(`Are you sure you want to ${label} ${count} selected application(s)?`)) return;

    setIsBulkProcessing(true);
    setBulkMessage(null);

    const idsArray = Array.from(selectedIds);
    const res = await bulkUpdateApplicationStatus(idsArray, status);

    setIsBulkProcessing(false);
    if (res.success) {
      // Update local state
      setApplications((prev) =>
        prev.map((a) => (selectedIds.has(a.id) ? { ...a, status } : a))
      );
      setSelectedIds(new Set());
      setBulkMessage(`Successfully updated ${res.processed} applications.`);
      setTimeout(() => setBulkMessage(null), 4000);
    } else {
      setBulkMessage(`Processed with errors: ${res.errors.join(", ")}`);
    }
  };

  return (
    <div className="space-y-8 pb-16 relative">
      {/* Top Admin Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
            <GraduationCap className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Admissions Intake Registry</h1>
            <p className="text-xs text-slate-500">Academic Excellence • Evaluator Control Panel</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/api/export/csv"
            download
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-blue-400 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Export CSV
          </a>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Public Portal
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={handleSignOut}>
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </div>

      {bulkMessage && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{bulkMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Intake</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{applications.length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Under Review</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">{countByStatus("under_review")}</div>
        </div>
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Approved</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1">{countByStatus("approved")}</div>
        </div>
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm">
          <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Rejected</span>
          <div className="text-2xl sm:text-3xl font-black text-rose-900 mt-1">{countByStatus("rejected")}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Cancelled</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-700 mt-1">{countByStatus("cancelled")}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, ref ID, or course..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {["all", "under_review", "pending", "approved", "rejected", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {st === "all" ? "All Applications" : st.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <Card className="overflow-hidden bg-white border-slate-200 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredApps.length > 0 && selectedIds.size === filteredApps.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Ref ID</th>
                <th className="py-3.5 px-4">Applicant (Ethiopia)</th>
                <th className="py-3.5 px-4">Course Applied</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4">Files</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                    No applications match the current search query or filter.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const isSelected = selectedIds.has(app.id);
                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-blue-50/40 transition-colors group cursor-pointer ${
                        isSelected ? "bg-blue-50/60" : ""
                      }`}
                      onClick={() => router.push(`/admin/applications/${app.id}`)}
                    >
                      <td
                        className="py-4 px-4 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectOne(app.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                        />
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-blue-700">
                        {app.id}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {app.full_name}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px] mt-0.5">{app.email}</div>
                      </td>

                      <td className="py-4 px-4 text-slate-700 font-medium max-w-xs truncate">
                        {app.course_applied}
                      </td>

                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(app.created_at)}
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                          <FileText className="w-3 h-3 mr-1 text-blue-600" />
                          {app.files?.length || 0}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <Badge status={app.status} />
                      </td>

                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl px-6 py-3.5 flex items-center gap-4 border border-slate-700 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              {selectedIds.size}
            </span>
            <span className="text-xs font-medium text-slate-300">Selected</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <button
            onClick={() => handleBulkAction("approved")}
            disabled={isBulkProcessing}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approve All
          </button>

          <button
            onClick={() => handleBulkAction("rejected")}
            disabled={isBulkProcessing}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            Reject All
          </button>

          <div className="h-4 w-px bg-slate-700" />

          <button
            onClick={() => setSelectedIds(new Set())}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
