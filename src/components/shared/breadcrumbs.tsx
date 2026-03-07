import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { JsonLd } from "@/components/shared/json-ld"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
    })),
  }

  return (
    <nav aria-label="Навигация" className="mb-6">
      <JsonLd data={jsonLd} />
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            {i === 0 && <Home className="mr-0.5 h-3 w-3" />}
            {item.href && i < items.length - 1 ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span className={i === items.length - 1 ? "text-foreground font-medium" : ""}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
