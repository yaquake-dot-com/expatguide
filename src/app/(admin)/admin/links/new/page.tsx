import { PageHeader } from "@/components/admin/page-header"
import { LinkForm } from "@/components/admin/links/link-form"
import { getLinkCategories } from "@/actions/link-categories"
import { getUserCountryScope } from "@/lib/safe-action"
import { db } from "@/lib/db"

export default async function NewLinkPage() {
  const countryScope = await getUserCountryScope()
  const [categories, countries] = await Promise.all([
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
      <PageHeader title="Новая ссылка" />
      <LinkForm countries={countries} categories={categories} />
    </div>
  )
}
