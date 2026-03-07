import { notFound } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { CountryForm } from "@/components/admin/countries/country-form"
import { getCountryById } from "@/actions/countries"

interface EditCountryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCountryPage({ params }: EditCountryPageProps) {
  const { id } = await params
  const country = await getCountryById(id)

  if (!country) {
    notFound()
  }

  return (
    <div>
      <PageHeader title={`Редактировать: ${country.name}`} />
      <CountryForm
        initialData={{
          id: country.id,
          name: country.name,
          nameIn: country.nameIn,
          nameFor: country.nameFor,
          slug: country.slug,
          code: country.code,
          flag: country.flag,
          isActive: country.isActive,
          sortOrder: country.sortOrder,
        }}
      />
    </div>
  )
}
