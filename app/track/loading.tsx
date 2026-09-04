import { Skeleton } from "@/components/ui/Skeleton";

export default function TrackLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <Skeleton className="h-10 w-10 rounded-2xl mx-auto bg-slate-700" />
          <Skeleton className="h-10 w-64 mx-auto bg-slate-700" />
          <Skeleton className="h-4 w-48 mx-auto bg-slate-700" />
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
