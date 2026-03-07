import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SITE_NAME, ITEMS_PER_PAGE } from "@/lib/constants"
import { ArticleCard } from "@/components/shared/article-card"
import { Pagination } from "@/components/shared/pagination"
import { EmptyState } from "@/components/shared/empty-state"
import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { AdBanner } from "@/components/shared/ad-banner"

interface Props {
  params: Promise<{ country_slug: string }>
  searchParams: Promise<{ type?: string; category?: string; page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country_slug } = await params
  const country = await db.country.findUnique({ where: { slug: country_slug } })
  if (!country) return {}
  const forName = country.nameFor || `для ${country.name}`
  const inName = country.nameIn || `в ${country.name}`
  const title = `Статьи ${forName}`
  const description = `Полезные статьи и гайды для русскоязычных ${inName}`
  const url = `/${country_slug}/articles`
  return {
    title,
    description,
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: url },
  }
}

export default async function ArticlesPage({ params, searchParams }: Props) {
  const { country_slug } = await params
  const sp = await searchParams

  const country = await db.country.findUnique({
    where: { slug: country_slug, isActive: true },
  })
  if (!country) notFound()

  const forName = country.nameFor || `для ${country.name}`

  const categories = await db.articleCategory.findMany({
    orderBy: { name: "asc" },
  })

  const page = Math.max(1, parseInt(sp.page || "1"))
  const isGeneral = sp.type === "GENERAL"
  const isCountry = sp.type === "COUNTRY"

  const where = {
    status: "PUBLISHED" as const,
    ...(isGeneral
      ? { type: "GENERAL" as const }
      : isCountry
        ? { countryId: country.id, type: "COUNTRY" as const }
        : {
            OR: [
              { countryId: country.id, type: "COUNTRY" as const },
              { type: "GENERAL" as const },
            ],
          }),
    ...(sp.category ? { category: { slug: sp.category } } : {}),
  }

  const [articles, total] = await Promise.all([
    db.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        category: { select: { name: true } },
        country: { select: { name: true, flag: true, slug: true } },
      },
    }),
    db.article.count({ where }),
  ])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const filterStr = [
    sp.type ? `type=${sp.type}` : "",
    sp.category ? `category=${sp.category}` : "",
  ]
    .filter(Boolean)
    .join("&")
  const baseUrl = `/${country_slug}/articles${filterStr ? `?${filterStr}` : ""}`

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Главная", href: `/${country_slug}` },
          { label: `${country.flag} ${country.name}`, href: `/${country_slug}` },
          { label: "Статьи" },
        ]}
      />

      <AdBanner slot="HERO_BANNER" countryId={country.id} className="mb-6" />

      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">
          {country.flag} Статьи {isGeneral ? "" : forName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {total} {total === 1 ? "статья" : "статей"}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        {/* Row 1: Content type */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={!sp.type ? "default" : "outline"}
            className="cursor-pointer"
            asChild
          >
            <Link href={`/${country_slug}/articles${sp.category ? `?category=${sp.category}` : ""}`}>
              Все
            </Link>
          </Badge>
          <Badge
            variant={sp.type === "GENERAL" ? "default" : "outline"}
            className="cursor-pointer"
            asChild
          >
            <Link href={`/${country_slug}/articles?type=GENERAL${sp.category ? `&category=${sp.category}` : ""}`}>
              Общие гайды
            </Link>
          </Badge>
          <Badge
            variant={sp.type === "COUNTRY" ? "default" : "outline"}
            className="cursor-pointer"
            asChild
          >
            <Link href={`/${country_slug}/articles?type=COUNTRY${sp.category ? `&category=${sp.category}` : ""}`}>
              {country.flag} {country.name}
            </Link>
          </Badge>
        </div>
        {/* Row 2: Categories */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={!sp.category ? "default" : "outline"}
            className="cursor-pointer"
            asChild
          >
            <Link href={`/${country_slug}/articles${sp.type ? `?type=${sp.type}` : ""}`}>
              Все темы
            </Link>
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={sp.category === cat.slug ? "default" : "outline"}
              className="cursor-pointer"
              asChild
            >
              <Link
                href={`/${country_slug}/articles?${sp.type ? `type=${sp.type}&` : ""}category=${cat.slug}`}
              >
                {cat.name}
              </Link>
            </Badge>
          ))}
        </div>
      </div>

      {articles.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard
                key={a.id}
                title={a.title}
                slug={a.slug}
                excerpt={a.excerpt}
                coverImage={a.coverImage}
                categoryName={a.category.name}
                countrySlug={country_slug}
                countryName={a.country?.name}
                countryFlag={a.country?.flag}
                publishedAt={a.publishedAt}
              />
            ))}
          </div>
          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              baseUrl={baseUrl}
            />
          </div>
        </>
      ) : (
        <EmptyState
          icon={FileText}
          title="Статьи не найдены"
          description="Попробуйте выбрать другую категорию"
        />
      )}
    </div>
  )
}
