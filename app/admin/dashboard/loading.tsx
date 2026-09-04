import { SkeletonKpiCard, SkeletonTable, SkeletonChart } from "@/components/ui/Skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar skeleton */}
      <div className="w-64 bg-slate-900 p-4 space-y-3 hidden lg:block">
        <div className="h-10 w-32 bg-slate-800 rounded-xl mb-8" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-10 w-full bg-slate-800 rounded-lg" />
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-6 space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonKpiCard key={i} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>

        {/* Table */}
        <SkeletonTable rows={6} />
      </div>
    </div>
  );
}
