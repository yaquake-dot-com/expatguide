import { Skeleton } from "@/components/ui/skeleton"

export default function CountryHomeLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <Skeleton className="h-[280px] w-full rounded-none" />

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8">
        <div className="min-w-0 flex-1 space-y-8">
          {/* Ad banner */}
          <Skeleton className="h-20 w-full rounded-lg" />

          {/* Articles section */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[16/9] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>

          {/* Guides section */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[16/9] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden w-72 shrink-0 space-y-6 lg:block">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
