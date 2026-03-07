import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ArticleCardProps {
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  categoryName: string
  countryName?: string | null
  countryFlag?: string | null
  countrySlug: string
  publishedAt: Date | string | null
  className?: string
}

export function ArticleCard({
  title,
  slug,
  excerpt,
  coverImage,
  categoryName,
  countryName,
  countryFlag,
  countrySlug,
  publishedAt,
  className,
}: ArticleCardProps) {
  const href = `/${countrySlug}/articles/${slug}`
  const date = publishedAt
    ? typeof publishedAt === "string" ? new Date(publishedAt) : publishedAt
    : null

  return (
    <Link href={href} className={cn("group block", className)}>
      <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
        {/* Cover image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <span className="text-4xl text-primary/30">
                {title.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge variant="secondary" className="text-xs shadow-sm">
              {categoryName}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          {/* Country + Date row */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {countryName && (
              <>
                <span>
                  {countryFlag && `${countryFlag} `}
                  {countryName}
                </span>
                <span>&middot;</span>
              </>
            )}
            {date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(date, "d MMM yyyy", { locale: ru })}
              </span>
            )}
          </div>

          {/* Title — min-h ensures consistent card height */}
          <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Excerpt */}
          {excerpt && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {excerpt}
            </p>
          )}
        </div>
      </Card>
    </Link>
  )
}
