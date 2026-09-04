import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function CourseDetailLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="h-16 bg-white border-b border-slate-200" />

      {/* Hero skeleton */}
      <div className="bg-slate-900 py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-4 w-32 bg-slate-800" />
          <Skeleton className="h-6 w-48 rounded-full bg-slate-800" />
          <Skeleton className="h-10 w-2/3 bg-slate-800" />
          <Skeleton className="h-5 w-1/2 bg-slate-800" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 max-w-3xl">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
              <Skeleton className="h-6 w-48" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full rounded-xl mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
