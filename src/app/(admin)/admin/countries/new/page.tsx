import { PageHeader } from "@/components/admin/page-header"
import { CountryForm } from "@/components/admin/countries/country-form"

export default function NewCountryPage() {
  return (
    <div>
      <PageHeader title="Новая страна" />
      <CountryForm />
    </div>
  )
}
