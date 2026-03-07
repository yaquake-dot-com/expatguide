import { notFound } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { CityForm } from "@/components/admin/cities/city-form"
import { getCityById } from "@/actions/cities"
import { getUserCountryScope } from "@/lib/safe-action"
import { db } from "@/lib/db"

interface EditCityPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCityPage({ params }: EditCityPageProps) {
  const { id } = await params
  const city = await getCityById(id)

  if (!city) {
    notFound()
  }

  const countryScope = await getUserCountryScope()
  const countries = await db.country.findMany({
    where: {
      isActive: true,
      ...(countryScope ? { id: { in: countryScope } } : {}),
    },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, flag: true },
  })

  return (
    <div>
      <PageHeader title={`Редактировать: ${city.name}`} />
      <CityForm
        countries={countries}
        initialData={{
          id: city.id,
          name: city.name,
          slug: city.slug,
          countryId: city.countryId,
        }}
      />
    </div>
  )
}
