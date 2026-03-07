import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  createHref?: string
  createLabel?: string
  children?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  createHref,
  createLabel = "Создать",
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold font-heading">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {createHref && (
          <Button asChild>
            <Link href={createHref}>
              <Plus className="mr-2 h-4 w-4" />
              {createLabel}
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
