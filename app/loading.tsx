import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      {/* Navbar skeleton */}
      <div className="h-16 bg-white border-b border-slate-200" />

      {/* Hero skeleton */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Skeleton className="h-6 w-48 mx-auto rounded-full bg-slate-700" />
          <Skeleton className="h-12 w-3/4 mx-auto bg-slate-700" />
          <Skeleton className="h-5 w-2/3 mx-auto bg-slate-700" />
          <div className="flex justify-center gap-4 mt-8">
            <Skeleton className="h-12 w-40 rounded-xl bg-slate-700" />
            <Skeleton className="h-12 w-40 rounded-xl bg-slate-700" />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Courses skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Skeleton className="h-8 w-64 mx-auto mb-8" />
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
