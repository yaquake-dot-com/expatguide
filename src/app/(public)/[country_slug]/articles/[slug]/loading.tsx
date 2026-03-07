import { Skeleton } from "@/components/ui/skeleton"

export default function ArticleDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Skeleton className="mb-6 h-4 w-48" />
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="mb-4 h-10 w-full" />
      <Skeleton className="mb-4 h-5 w-3/4" />
      <div className="mb-8 flex gap-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-36" />
      </div>
      <Skeleton className="mb-8 aspect-[2/1] w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
