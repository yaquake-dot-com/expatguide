import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null

  function pageUrl(page: number) {
    const separator = baseUrl.includes("?") ? "&" : "?"
    return page === 1 ? baseUrl : `${baseUrl}${separator}page=${page}`
  }

  // Generate page numbers with ellipsis
  const pages: (number | "...")[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...")
    }
  }

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Пагинация">
      {currentPage > 1 && (
        <Button variant="outline" size="icon" className="h-9 w-9" asChild>
          <Link href={pageUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
      )}

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-muted-foreground">...</span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="icon"
            className={cn("h-9 w-9", page === currentPage && "pointer-events-none")}
            asChild={page !== currentPage}
          >
            {page === currentPage ? (
              <span>{page}</span>
            ) : (
              <Link href={pageUrl(page)}>{page}</Link>
            )}
          </Button>
        )
      )}

      {currentPage < totalPages && (
        <Button variant="outline" size="icon" className="h-9 w-9" asChild>
          <Link href={pageUrl(currentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </nav>
  )
}
