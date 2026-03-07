import { Skeleton } from "@/components/ui/skeleton"

export default function ArticlesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="mb-2 h-5 w-48" />
      <Skeleton className="mb-4 h-20 w-full rounded-lg" />
      <Skeleton className="mb-2 h-10 w-64" />
      <Skeleton className="mb-6 h-4 w-24" />

      {/* Filter pills */}
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>

      {/* Article grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[16/9] w-full rounded-lg" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
