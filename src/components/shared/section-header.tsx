import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface SectionHeaderProps {
  title: string
  href?: string
  linkText?: string
}

export function SectionHeader({ title, href, linkText = "Все" }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-2xl font-bold font-heading">{title}</h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {linkText}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
