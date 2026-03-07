import { Suspense } from "react"
import { PageHeader } from "@/components/admin/page-header"
import { DataTable } from "@/components/admin/data-table"
import { specialistsColumns } from "@/components/admin/specialists/specialists-columns"
import { SpecialistsFilters } from "@/components/admin/specialists/specialists-filters"
import { getSpecialists } from "@/actions/specialists"
import { getUserCountryScope } from "@/lib/safe-action"
import { db } from "@/lib/db"

interface SpecialistsPageProps {
  searchParams: Promise<{ countryId?: string; categoryId?: string }>
}

export default async function SpecialistsPage({ searchParams }: SpecialistsPageProps) {
  const { countryId, categoryId } = await searchParams
  const countryScope = await getUserCountryScope()

  const [specialists, countries, categories] = await Promise.all([
    getSpecialists({ countryId, categoryId, countryScope }),
    db.country.findMany({
      where: {
        isActive: true,
        ...(countryScope ? { id: { in: countryScope } } : {}),
      },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, flag: true },
    }),
    db.specialistCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ])

  return (
    <div>
      <PageHeader
        title="Специалисты"
        description="Управление справочником специалистов"
        createHref="/admin/specialists/new"
        createLabel="Добавить специалиста"
      />
      <div className="mb-4">
        <Suspense>
          <SpecialistsFilters
            countries={countries}
            categories={categories}
          />
        </Suspense>
      </div>
      <DataTable
        columns={specialistsColumns}
        data={specialists}
        searchKey="name"
        searchPlaceholder="Поиск по имени..."
      />
    </div>
  )
}
