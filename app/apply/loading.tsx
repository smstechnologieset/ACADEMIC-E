import { Skeleton } from "@/components/ui/Skeleton";

export default function ApplyLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-5 mt-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
          <Skeleton className="h-12 w-full rounded-xl mt-6" />
        </div>
      </div>
    </div>
  );
}
