import { getCities } from "@/actions/cities"
import { PageHeader } from "@/components/admin/page-header"
import { DataTable } from "@/components/admin/data-table"
import { citiesColumns } from "@/components/admin/cities/cities-columns"
import { CitiesFilters } from "@/components/admin/cities/cities-filters"
import { getUserCountryScope } from "@/lib/safe-action"
import { db } from "@/lib/db"

interface Props {
  searchParams: Promise<{ countryId?: string }>
}

export default async function CitiesPage({ searchParams }: Props) {
  const sp = await searchParams
  const countryScope = await getUserCountryScope()
  const [cities, countries] = await Promise.all([
    getCities(sp.countryId, countryScope),
    db.country.findMany({
      where: {
        isActive: true,
        ...(countryScope ? { id: { in: countryScope } } : {}),
      },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, flag: true },
    }),
  ])

  return (
    <div>
      <PageHeader
        title="Города"
        description="Управление городами"
        createHref="/admin/cities/new"
        createLabel="Добавить город"
      />
      <div className="mb-4">
        <CitiesFilters countries={countries} />
      </div>
      <DataTable
        columns={citiesColumns}
        data={cities}
        searchKey="name"
        searchPlaceholder="Поиск по названию..."
      />
    </div>
  )
}
