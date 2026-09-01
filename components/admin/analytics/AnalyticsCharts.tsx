"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { AnalyticsSummary } from "@/types";
import { TrendingUp, Award, BarChart3, Users, Eye, Sparkles } from "lucide-react";

interface AnalyticsChartsProps {
  analytics: AnalyticsSummary;
}

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);

  const maxTrend = Math.max(...analytics.applicationTrends.map((t) => t.count), 5);
  const maxCourseApps = Math.max(...analytics.popularCourses.map((c) => c.applicationsCount), 1);

  return (
    <div className="space-y-8">
      {/* 2-Column Grid: Timeline Chart & Popular Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Application Volume Trends (Interactive SVG Area Chart) */}
        <div className="lg:col-span-7">
          <Card className="p-6 bg-white border-slate-200 shadow-md h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                    Applicant Inflow Timeline
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Daily submissions registered over the past 7 days</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {analytics.totalApplications} Total Dossiers
                </span>
              </div>

              {/* Interactive SVG Bar & Area Visualizer */}
              <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2">
                {analytics.applicationTrends.map((trend, idx) => {
                  const heightPercent = Math.max(Math.round((trend.count / maxTrend) * 100), 12);
                  const isHovered = hoveredTrendIdx === idx;

                  return (
                    <div
                      key={trend.date}
                      className="flex-1 flex flex-col items-center group relative cursor-pointer"
                      onMouseEnter={() => setHoveredTrendIdx(idx)}
                      onMouseLeave={() => setHoveredTrendIdx(null)}
                    >
                      {/* Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-12 z-20 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold shadow-lg whitespace-nowrap animate-in fade-in zoom-in duration-150">
                          {trend.count} Applications ({trend.cumulative} Total)
                        </div>
                      )}

                      {/* Bar with gradient and smooth height */}
                      <div className="w-full max-w-[40px] bg-slate-100 rounded-t-xl overflow-hidden flex items-end h-36">
                        <div
                          className={`w-full rounded-t-xl transition-all duration-300 ${
                            isHovered
                              ? "bg-blue-700 shadow-md shadow-blue-500/30 scale-x-105"
                              : "bg-blue-600 hover:bg-blue-500"
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      {/* Label */}
                      <span className={`text-[10px] font-semibold mt-2 ${isHovered ? "text-blue-700 font-bold" : "text-slate-500"}`}>
                        {trend.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-4">
              <span>Intake tracking active</span>
              <span className="font-semibold text-blue-700">Real-time DB Sync</span>
            </div>
          </Card>
        </div>

        {/* Right: Popular Courses Ranking */}
        <div className="lg:col-span-5">
          <Card className="p-6 bg-white border-slate-200 shadow-md h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                    Top Applied Programs
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Most in-demand tracks based on applicant submissions</p>
                </div>
              </div>

              <div className="space-y-3.5">
                {analytics.popularCourses.slice(0, 5).map((course, idx) => {
                  const percent = Math.max(Math.round((course.applicationsCount / maxCourseApps) * 100), 10);
                  return (
                    <div key={course.courseTitle} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 truncate max-w-[200px]">
                          {idx + 1}. {course.courseTitle}
                        </span>
                        <div className="flex items-center space-x-2 text-slate-600 shrink-0">
                          <span className="font-bold text-blue-700">{course.applicationsCount} apps</span>
                          <span className="text-[10px] text-slate-400 flex items-center">
                            <Eye className="w-3 h-3 mr-0.5" />
                            {course.viewsCount}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-500 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 mt-4">
              Rankings dynamically recalculate as new dossiers are submitted.
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
              <p className="text-xs text-slate-500 mt-0.5">Qualifications reported across current applicant pool</p>
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
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${q.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
