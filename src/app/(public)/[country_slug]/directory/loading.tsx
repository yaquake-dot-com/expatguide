import { Skeleton } from "@/components/ui/skeleton"

export default function DirectoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="mb-2 h-5 w-48" />
      <Skeleton className="mb-4 h-20 w-full rounded-lg" />
      <Skeleton className="mb-2 h-10 w-72" />
      <Skeleton className="mb-6 h-4 w-36" />

      {/* Filters */}
      <div className="mb-6 flex gap-3">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Specialist grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}
