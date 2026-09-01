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
} from "lucide-react";
import { Application, ApplicationStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

interface ApplicationsTableProps {
  initialApplications: Application[];
}

export function ApplicationsDashboardClient({ initialApplications }: ApplicationsTableProps) {
  const router = useRouter();
  const [applications] = useState<Application[]>(initialApplications);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  return (
    <div className="space-y-8">
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

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Submissions</span>
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
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or course..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {["all", "under_review", "pending", "approved", "rejected"].map((st) => (
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
                <th className="py-3.5 px-4">Applicant (Ethiopia)</th>
                <th className="py-3.5 px-4">Course Applied</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4">FAYDA & Files</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                    No applications match the current search query or filter.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/admin/applications/${app.id}`)}
                  >
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
