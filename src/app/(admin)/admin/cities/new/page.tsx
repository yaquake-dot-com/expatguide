import { PageHeader } from "@/components/admin/page-header"
import { CityForm } from "@/components/admin/cities/city-form"
import { getUserCountryScope } from "@/lib/safe-action"
import { db } from "@/lib/db"

export default async function NewCityPage() {
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
      <PageHeader title="Новый город" />
      <CityForm countries={countries} />
    </div>
  )
}
