import { notFound } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { SpecialistCategoryForm } from "@/components/admin/specialist-categories/specialist-category-form"
import { getSpecialistCategoryById } from "@/actions/specialist-categories"

interface EditSpecialistCategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditSpecialistCategoryPage({ params }: EditSpecialistCategoryPageProps) {
  const { id } = await params
  const category = await getSpecialistCategoryById(id)

  if (!category) {
    notFound()
  }

  return (
    <div>
      <PageHeader title={`Редактировать: ${category.name}`} />
      <SpecialistCategoryForm
        initialData={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon: category.icon,
          sortOrder: category.sortOrder,
        }}
      />
    </div>
  )
}
