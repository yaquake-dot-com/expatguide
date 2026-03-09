import { notFound } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { BreadcrumbSetter } from "@/components/admin/breadcrumb-setter"
import { LinkForm } from "@/components/admin/links/link-form"
import { getLinkById } from "@/actions/links"
import { getLinkCategories } from "@/actions/link-categories"
import { getUserCountryScope } from "@/lib/safe-action"
import { db } from "@/lib/db"

interface Props { params: Promise<{ id: string }> }

export default async function EditLinkPage({ params }: Props) {
  const { id } = await params
  const link = await getLinkById(id)
  if (!link) notFound()

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
      <BreadcrumbSetter id={link.id} label={link.title} />
      <PageHeader title={`Редактировать: ${link.title}`} />
      <LinkForm
        countries={countries}
        categories={categories}
        initialData={{
          id: link.id, title: link.title, url: link.url,
          description: link.description, icon: link.icon,
          countryId: link.countryId, categoryId: link.categoryId,
          sortOrder: link.sortOrder, isActive: link.isActive,
        }}
      />
    </div>
  )
}
