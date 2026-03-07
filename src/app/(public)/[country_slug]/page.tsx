import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { SITE_NAME } from "@/lib/constants"
import { ArticleCard } from "@/components/shared/article-card"
import { SectionHeader } from "@/components/shared/section-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, FileText, Link2, ArrowRight, ExternalLink } from "lucide-react"
import { JsonLd } from "@/components/shared/json-ld"
import { Carousel } from "@/components/shared/carousel"
import { AdBanner } from "@/components/shared/ad-banner"

interface CountryPageProps {
  params: Promise<{ country_slug: string }>
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { country_slug } = await params
  const country = await db.country.findUnique({ where: { slug: country_slug } })
  if (!country) return {}
  const inName = country.nameIn || `в ${country.name}`
  const title = `${country.flag} Русский гид ${inName}`
  const description = `Справочник специалистов, статьи и полезные ссылки для русскоязычных ${inName}`
  return {
    title,
    description,
    openGraph: { title, description, url: `/${country_slug}`, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `/${country_slug}` },
  }
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { country_slug } = await params

  const country = await db.country.findUnique({
    where: { slug: country_slug, isActive: true },
  })
  if (!country) notFound()

  const inName = country.nameIn || `в ${country.name}`
  const forName = country.nameFor || `для ${country.name}`

  const [countryArticles, generalArticles, specialistCount, links, linkCategories, ad] =
    await Promise.all([
      db.article.findMany({
        where: { countryId: country.id, status: "PUBLISHED", type: "COUNTRY" },
        orderBy: { publishedAt: "desc" },
        take: 6,
        include: {
          category: { select: { name: true } },
          country: { select: { name: true, flag: true, slug: true } },
        },
      }),
      db.article.findMany({
        where: { status: "PUBLISHED", type: "GENERAL" },
        orderBy: { publishedAt: "desc" },
        take: 6,
        include: { category: { select: { name: true } } },
      }),
      db.specialist.count({
        where: { countryId: country.id, isActive: true },
      }),
      db.usefulLink.findMany({
        where: {
          isActive: true,
          OR: [{ countryId: country.id }, { countryId: null }],
        },
        orderBy: { sortOrder: "asc" },
        take: 10,
        include: { category: { select: { name: true, slug: true } } },
      }),
      db.linkCategory.findMany({ orderBy: { name: "asc" } }),
      db.advertisement.findFirst({
        where: {
          isActive: true,
          slot: "SIDEBAR",
          startsAt: { lte: new Date() },
          endsAt: { gte: new Date() },
          OR: [{ countryId: country.id }, { countryId: null }],
        },
      }),
    ])

  const [articleCount, cityCount] = await Promise.all([
    db.article.count({
      where: {
        status: "PUBLISHED",
        OR: [{ countryId: country.id }, { type: "GENERAL" }],
      },
    }),
    db.city.count({ where: { countryId: country.id } }),
  ])

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/${country_slug}`,
    description: `Справочник специалистов, статьи и полезные ссылки для русскоязычных ${inName}`,
  }

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      {/* Hero — full width */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="mb-3 text-3xl font-bold font-heading md:text-4xl lg:text-5xl">
                {country.flag} Русский гид {inName}
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Справочник специалистов, полезные статьи и ссылки для русскоязычных
              </p>
            </div>
            <div className="flex gap-4">
              {[
                { value: specialistCount, label: "Специалистов" },
                { value: articleCount, label: "Статей" },
                { value: cityCount, label: "Городов" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm">
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-primary-foreground/70">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="secondary" className="gap-2">
              <Link href={`/${country_slug}/directory`}><Users className="h-4 w-4" />Справочник</Link>
            </Button>
            <Button asChild variant="secondary" className="gap-2">
              <Link href={`/${country_slug}/articles`}><FileText className="h-4 w-4" />Статьи</Link>
            </Button>
            <Button asChild variant="secondary" className="gap-2">
              <Link href={`/${country_slug}/links`}><Link2 className="h-4 w-4" />Полезные ссылки</Link>
            </Button>
          </div>
        </div>
      </section>

    <div className="mx-auto max-w-7xl px-4 py-8">
      <AdBanner slot="HERO_BANNER" countryId={country.id} className="mb-8" />
      <div className="flex flex-col gap-10 lg:flex-row">
        {/* Main */}
        <div className="min-w-0 flex-1 space-y-10">
          {/* Country articles */}
          <section>
            <SectionHeader title={`Полезное ${forName}`} href={`/${country_slug}/articles?type=COUNTRY`} linkText="Все статьи" />
            {countryArticles.length > 0 ? (
              <Carousel autoplay slideSize="basis-full sm:basis-1/2 lg:basis-1/3">
                {countryArticles.map((a) => (
                  <ArticleCard key={a.id} title={a.title} slug={a.slug} excerpt={a.excerpt} coverImage={a.coverImage} categoryName={a.category.name} countrySlug={country_slug} publishedAt={a.publishedAt} />
                ))}
              </Carousel>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">Статьи {forName} скоро появятся</div>
            )}
          </section>

          {/* General articles */}
          <section>
            <SectionHeader title="Общие гайды" href={`/${country_slug}/articles?type=GENERAL`} linkText="Все гайды" />
            {generalArticles.length > 0 ? (
              <Carousel autoplay slideSize="basis-full sm:basis-1/2 lg:basis-1/3">
                {generalArticles.map((a) => (
                  <ArticleCard key={a.id} title={a.title} slug={a.slug} excerpt={a.excerpt} coverImage={a.coverImage} categoryName={a.category.name} countrySlug={country_slug} publishedAt={a.publishedAt} />
                ))}
              </Carousel>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">Общие статьи скоро появятся</div>
            )}
          </section>

          {/* Links */}
          <section>
            <SectionHeader title="Полезные ссылки" href={`/${country_slug}/links`} linkText="Все ссылки" />
            {links.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {links.map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <ExternalLink className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-tight group-hover:text-primary">{link.title}</p>
                      {link.description && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{link.description}</p>}
                      <Badge variant="outline" className="mt-1 text-xs">{link.category.name}</Badge>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">Полезные ссылки скоро появятся</div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="w-full shrink-0 space-y-6 lg:w-72">
          {ad && (
            <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" data-slot="ad-banner-sidebar" className="block">
              <Card className="gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
                {ad.imageUrl ? (
                  <img src={ad.imageUrl} alt={ad.title} className="h-auto w-full" />
                ) : ad.htmlContent ? (
                  <CardContent className="p-0" dangerouslySetInnerHTML={{ __html: ad.htmlContent }} />
                ) : (
                  <CardContent className="p-4"><p className="font-semibold">{ad.title}</p></CardContent>
                )}
              </Card>
            </a>
          )}

          <Card>
            <CardContent className="p-4">
              <h3 className="mb-2 font-semibold font-heading"><Users className="mr-2 inline h-4 w-4" />Справочник</h3>
              <p className="mb-3 text-sm text-muted-foreground">{specialistCount} специалистов {inName}</p>
              <Button asChild variant="outline" size="sm" className="w-full gap-2">
                <Link href={`/${country_slug}/directory`}>Найти специалиста<ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 font-semibold font-heading">Категории ссылок</h3>
              <div className="flex flex-wrap gap-2">
                {linkCategories.map((cat) => (
                  <Badge key={cat.id} variant="secondary" className="cursor-pointer" asChild>
                    <Link href={`/${country_slug}/links?category=${cat.slug}`}>{cat.name}</Link>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
    </>
  )
}
