import { PageHeader } from "@/components/admin/page-header"
import { AdForm } from "@/components/admin/ads/ad-form"
import { getUserCountryScope } from "@/lib/safe-action"
import { db } from "@/lib/db"

export default async function NewAdPage() {
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
      <PageHeader title="Новый баннер" />
      <AdForm countries={countries} />
    </div>
  )
}
