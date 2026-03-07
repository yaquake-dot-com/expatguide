import { PageHeader } from "@/components/admin/page-header"
import { SpecialistForm } from "@/components/admin/specialists/specialist-form"
import { getUserCountryScope } from "@/lib/safe-action"
import { db } from "@/lib/db"

export default async function NewSpecialistPage() {
  const countryScope = await getUserCountryScope()
  const [countries, categories] = await Promise.all([
    db.country.findMany({
      where: {
        isActive: true,
        ...(countryScope ? { id: { in: countryScope } } : {}),
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        flag: true,
        cities: {
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        },
      },
    }),
    db.specialistCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ])

  return (
    <div>
      <PageHeader title="Новый специалист" />
      <SpecialistForm countries={countries} categories={categories} />
    </div>
  )
}
