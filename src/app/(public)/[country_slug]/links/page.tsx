import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Link2 } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { AdBanner } from "@/components/shared/ad-banner"

interface Props {
  params: Promise<{ country_slug: string }>
  searchParams: Promise<{ category?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country_slug } = await params
  const country = await db.country.findUnique({ where: { slug: country_slug } })
  if (!country) return {}
  const forName = country.nameFor || `для ${country.name}`
  const inName = country.nameIn || `в ${country.name}`
  const title = `Полезные ссылки ${forName}`
  const description = `Полезные ссылки и ресурсы для русскоязычных ${inName}`
  const url = `/${country_slug}/links`
  return {
    title,
    description,
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: url },
  }
}

export default async function LinksPage({ params, searchParams }: Props) {
  const { country_slug } = await params
  const sp = await searchParams

  const country = await db.country.findUnique({
    where: { slug: country_slug, isActive: true },
  })
  if (!country) notFound()

  const forName = country.nameFor || `для ${country.name}`

  const categories = await db.linkCategory.findMany({
    orderBy: { name: "asc" },
    include: {
      links: {
        where: {
          isActive: true,
          OR: [{ countryId: country.id }, { countryId: null }],
          ...(sp.category ? { category: { slug: sp.category } } : {}),
        },
        orderBy: { sortOrder: "asc" },
        include: { country: { select: { name: true, flag: true } } },
      },
    },
  })

  // Filter categories: only show those with links, or the selected category
  const filteredCategories = sp.category
    ? categories.filter((c) => c.slug === sp.category)
    : categories.filter((c) => c.links.length > 0)

  const totalLinks = filteredCategories.reduce((sum, c) => sum + c.links.length, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Главная", href: `/${country_slug}` },
          { label: `${country.flag} ${country.name}`, href: `/${country_slug}` },
          { label: "Полезные ссылки" },
        ]}
      />

      <AdBanner slot="HERO_BANNER" countryId={country.id} className="mb-6" />

      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">
          {country.flag} Полезные ссылки
        </h1>
        <p className="mt-1 text-muted-foreground">
          {totalLinks} ссылок {forName}
        </p>
      </div>

      {/* Category filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge
          variant={!sp.category ? "default" : "outline"}
          className="cursor-pointer"
          asChild
        >
          <Link href={`/${country_slug}/links`}>Все</Link>
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={sp.category === cat.slug ? "default" : "outline"}
            className="cursor-pointer"
            asChild
          >
            <Link href={`/${country_slug}/links?category=${cat.slug}`}>
              {cat.name}
              {!sp.category && (
                <span className="ml-1 opacity-60">({cat.links.length})</span>
              )}
            </Link>
          </Badge>
        ))}
      </div>

      {totalLinks > 0 ? (
        <div className="space-y-8">
          {filteredCategories.map((cat) => (
            <Card key={cat.id}>
              <CardHeader>
                <CardTitle className="text-lg">{cat.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        {link.icon ? (
                          <img src={link.icon} alt="" className="h-6 w-6" />
                        ) : (
                          <ExternalLink className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-tight group-hover:text-primary">
                          {link.title}
                        </p>
                        {link.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {link.description}
                          </p>
                        )}
                        {link.country && (
                          <span className="mt-1 inline-block text-xs text-muted-foreground">
                            {link.country.flag} {link.country.name}
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Link2}
          title="Ссылки не найдены"
          description="В этой категории пока нет ссылок"
        />
      )}
    </div>
  )
}
