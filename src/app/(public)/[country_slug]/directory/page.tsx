import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SITE_NAME, ITEMS_PER_PAGE } from "@/lib/constants"
import { SpecialistCard } from "@/components/shared/specialist-card"
import { Pagination } from "@/components/shared/pagination"
import { EmptyState } from "@/components/shared/empty-state"
import { DirectoryFilters } from "./filters"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { AdBanner } from "@/components/shared/ad-banner"
import { Users } from "lucide-react"

interface Props {
  params: Promise<{ country_slug: string }>
  searchParams: Promise<{ city?: string; category?: string; page?: string; q?: string; language?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country_slug } = await params
  const country = await db.country.findUnique({ where: { slug: country_slug } })
  if (!country) return {}
  const inName = country.nameIn || `в ${country.name}`
  const title = `Справочник специалистов ${inName}`
  const description = `Найдите русскоязычного специалиста ${inName}: юристы, врачи, бухгалтеры и другие`
  const url = `/${country_slug}/directory`
  return {
    title,
    description,
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: url },
  }
}

export default async function DirectoryPage({ params, searchParams }: Props) {
  const { country_slug } = await params
  const sp = await searchParams

  const country = await db.country.findUnique({
    where: { slug: country_slug, isActive: true },
    include: {
      cities: { orderBy: { name: "asc" }, select: { id: true, name: true } },
    },
  })
  if (!country) notFound()

  const inName = country.nameIn || `в ${country.name}`

  const categories = await db.specialistCategory.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  })

  const page = Math.max(1, parseInt(sp.page || "1"))
  const where = {
    countryId: country.id,
    isActive: true,
    // When filtering by city, also include specialists with cityId=null (available in all cities)
    ...(sp.city ? { OR: [{ cityId: sp.city }, { cityId: null }] } : {}),
    ...(sp.category ? { categoryId: sp.category } : {}),
    ...(sp.language ? { languages: { has: sp.language } } : {}),
    ...(sp.q
      ? {
          AND: [
            {
              OR: [
                { name: { contains: sp.q, mode: "insensitive" as const } },
                { description: { contains: sp.q, mode: "insensitive" as const } },
              ],
            },
          ],
        }
      : {}),
  }

  const [specialists, total] = await Promise.all([
    db.specialist.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        category: { select: { name: true } },
        city: { select: { name: true } },
      },
    }),
    db.specialist.count({ where }),
  ])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  // Build base URL preserving all filters
  const filterParams = new URLSearchParams()
  if (sp.city) filterParams.set("city", sp.city)
  if (sp.category) filterParams.set("category", sp.category)
  if (sp.language) filterParams.set("language", sp.language)
  if (sp.q) filterParams.set("q", sp.q)
  const qs = filterParams.toString()
  const baseUrl = `/${country_slug}/directory${qs ? `?${qs}` : ""}`

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Главная", href: `/${country_slug}` },
          { label: `${country.flag} ${country.name}`, href: `/${country_slug}` },
          { label: "Справочник специалистов" },
        ]}
      />

      <AdBanner slot="HERO_BANNER" countryId={country.id} className="mb-6" />

      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">
          {country.flag} Справочник специалистов
        </h1>
        <p className="mt-1 text-muted-foreground">
          {total} специалистов {inName}
        </p>
      </div>

      <DirectoryFilters
        cities={country.cities}
        categories={categories}
        countrySlug={country_slug}
      />

      {specialists.length > 0 ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {specialists.map((s) => (
              <SpecialistCard
                key={s.id}
                name={s.name}
                description={s.description}
                categoryName={s.category.name}
                cityName={s.city?.name}
                phone={s.phone}
                email={s.email}
                website={s.website}
                image={s.image}
                languages={s.languages}
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
          icon={Users}
          title="Специалисты не найдены"
          description="Попробуйте изменить фильтры или поисковый запрос"
        />
      )}
    </div>
  )
}
