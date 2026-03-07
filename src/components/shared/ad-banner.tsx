import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"

interface AdBannerProps {
  slot: "HERO_BANNER" | "SIDEBAR"
  countryId: string
  className?: string
}

export async function AdBanner({ slot, countryId, className }: AdBannerProps) {
  const ad = await db.advertisement.findFirst({
    where: {
      isActive: true,
      slot,
      startsAt: { lte: new Date() },
      endsAt: { gte: new Date() },
      OR: [{ countryId }, { countryId: null }],
    },
    orderBy: { createdAt: "desc" },
  })

  if (!ad) return null

  if (slot === "HERO_BANNER") {
    return (
      <a
        href={ad.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-slot="ad-banner-hero"
        className={`block rounded-lg transition-opacity hover:opacity-90 ${className || ""}`}
      >
        {ad.imageUrl ? (
          <img src={ad.imageUrl} alt={ad.title} className="h-auto w-full overflow-hidden rounded-[inherit]" />
        ) : ad.htmlContent ? (
          <div className="overflow-hidden rounded-[inherit]" dangerouslySetInnerHTML={{ __html: ad.htmlContent }} />
        ) : (
          <div className="bg-primary/10 p-4 text-center font-medium">{ad.title}</div>
        )}
      </a>
    )
  }

  // SIDEBAR
  return (
    <a
      href={ad.targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-slot="ad-banner-sidebar"
      className={`block ${className || ""}`}
    >
      <Card className="gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
        {ad.imageUrl ? (
          <img src={ad.imageUrl} alt={ad.title} className="h-auto w-full" />
        ) : ad.htmlContent ? (
          <CardContent className="p-0" dangerouslySetInnerHTML={{ __html: ad.htmlContent }} />
        ) : (
          <CardContent className="p-4">
            <p className="font-semibold">{ad.title}</p>
          </CardContent>
        )}
      </Card>
    </a>
  )
}
