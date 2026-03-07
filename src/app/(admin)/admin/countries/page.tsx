import { getCountries } from "@/actions/countries"
import { PageHeader } from "@/components/admin/page-header"
import { DataTable } from "@/components/admin/data-table"
import { countriesColumns } from "@/components/admin/countries/countries-columns"

export default async function CountriesPage() {
  const countries = await getCountries()

  return (
    <div>
      <PageHeader
        title="Страны"
        description="Управление странами портала"
        createHref="/admin/countries/new"
        createLabel="Добавить страну"
      />
      <DataTable
        columns={countriesColumns}
        data={countries}
        searchKey="name"
        searchPlaceholder="Поиск по названию..."
      />
    </div>
  )
}
