import { notFound } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { LinkCategoryForm } from "@/components/admin/link-categories/link-category-form"
import { getLinkCategoryById } from "@/actions/link-categories"

interface Props { params: Promise<{ id: string }> }

export default async function EditLinkCategoryPage({ params }: Props) {
  const { id } = await params
  const category = await getLinkCategoryById(id)
  if (!category) notFound()

  return (
    <div>
      <PageHeader title={`Редактировать: ${category.name}`} />
      <LinkCategoryForm initialData={{ id: category.id, name: category.name, slug: category.slug }} />
    </div>
  )
}
