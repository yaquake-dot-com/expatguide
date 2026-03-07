import { PageHeader } from "@/components/admin/page-header"
import { DataTable } from "@/components/admin/data-table"
import { linksColumns } from "@/components/admin/links/links-columns"
import { LinksFilters } from "@/components/admin/links/links-filters"
import { getLinks } from "@/actions/links"
import { getLinkCategories } from "@/actions/link-categories"
import { getUserCountryScope } from "@/lib/safe-action"
import { db } from "@/lib/db"

interface Props { searchParams: Promise<{ countryId?: string; categoryId?: string }> }

export default async function LinksPage({ searchParams }: Props) {
  const filters = await searchParams
  const countryScope = await getUserCountryScope()
  const [links, categories, countries] = await Promise.all([
    getLinks({ ...filters, countryScope }),
    getLinkCategories(),
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
        title="Полезные ссылки"
        description="Управление ссылками для эмигрантов"
        createHref="/admin/links/new"
        createLabel="Новая ссылка"
      />
      <div className="space-y-4">
        <LinksFilters countries={countries} categories={categories} />
        <DataTable columns={linksColumns} data={links} searchKey="title" searchPlaceholder="Поиск по названию..." />
      </div>
    </div>
  )
}
