"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { AnalyticsSummary } from "@/types";
import { TrendingUp, BarChart3, Users, Sparkles, Filter } from "lucide-react";

interface AnalyticsChartsProps {
  analytics: AnalyticsSummary;
}

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "all">("7d");

  const trendData = analytics.applicationTrends.map((t) => ({
    name: t.date,
    applications: t.count,
    cumulative: t.cumulative,
  }));

  const popularCoursesData = analytics.popularCourses.slice(0, 6).map((c) => ({
    name: c.courseTitle.length > 22 ? c.courseTitle.slice(0, 22) + "..." : c.courseTitle,
    fullName: c.courseTitle,
    applications: c.applicationsCount,
    views: c.viewsCount,
  }));

  const BAR_COLORS = ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

  return (
    <div className="space-y-8">
      {/* 2-Column Grid: Recharts Area Chart & Popular Courses Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Application Volume Trends (Recharts Area Chart) */}
        <div className="lg:col-span-7">
          <Card className="p-6 bg-white border-slate-200 shadow-md h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                    Applicant Inflow Velocity
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daily registrations & cumulative trajectory
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {analytics.totalApplications} Total Dossiers
                </span>
              </div>

              {/* Recharts Area Chart */}
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                              <p className="font-bold text-slate-300">{label}</p>
                              <p className="text-blue-400 font-semibold">
                                New Applications: {payload[0]?.value}
                              </p>
                              {payload[1] && (
                                <p className="text-sky-300">
                                  Cumulative Total: {payload[1]?.value}
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="applications"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorApplications)"
                      name="Applications"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-4">
              <span>Dynamic Intake Telemetry</span>
              <span className="font-semibold text-blue-700">Auto-Refreshed</span>
            </div>
          </Card>
        </div>

        {/* Right: Popular Courses Ranking (Recharts Horizontal / Vertical Bar Chart) */}
        <div className="lg:col-span-5">
          <Card className="p-6 bg-white border-slate-200 shadow-md h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                    Top Applied Programs
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Demand breakdown by registered candidates
                  </p>
                </div>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={popularCoursesData}
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 10, fill: "#475569" }}
                      width={100}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                              <p className="font-bold text-white">{data.fullName}</p>
                              <p className="text-blue-400 font-semibold">{data.applications} Applications</p>
                              <p className="text-slate-400 text-[10px]">{data.views} Catalog Views</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="applications" radius={[0, 6, 6, 0]}>
                      {popularCoursesData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 mt-4">
              Real-time curriculum ranking across all registered cohorts.
            </div>
          </Card>
        </div>
      </div>

      {/* Row 2: Qualification Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border-slate-200 shadow-md md:col-span-3">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-600" />
                Applicant Academic Background Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Qualifications reported across current applicant pool
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics.qualificationBreakdown.map((q) => (
              <div key={q.qualification} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block truncate">{q.qualification}</span>
                <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline justify-between">
                  <span>{q.count}</span>
                  <span className="text-xs font-bold text-blue-600">{q.percentage}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-full"
                    style={{ width: `${q.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
