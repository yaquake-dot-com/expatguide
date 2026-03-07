import { PageHeader } from "@/components/admin/page-header"
import { DataTable } from "@/components/admin/data-table"
import { adsColumns } from "@/components/admin/ads/ads-columns"
import { AdsFilters } from "@/components/admin/ads/ads-filters"
import { getAds } from "@/actions/ads"
import { getUserCountryScope } from "@/lib/safe-action"
import { db } from "@/lib/db"

interface Props { searchParams: Promise<{ slot?: string; countryId?: string }> }

export default async function AdsPage({ searchParams }: Props) {
  const filters = await searchParams
  const countryScope = await getUserCountryScope()
  const [ads, countries] = await Promise.all([
    getAds({ ...filters, countryScope }),
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
        title="Баннеры"
        description="Управление рекламными баннерами"
        createHref="/admin/ads/new"
        createLabel="Новый баннер"
      />
      <div className="space-y-4">
        <AdsFilters countries={countries} />
        <DataTable columns={adsColumns} data={ads} searchKey="title" searchPlaceholder="Поиск по названию..." />
      </div>
    </div>
  )
}
