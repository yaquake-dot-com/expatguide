import { PageHeader } from "@/components/admin/page-header"
import { SpecialistCategoryForm } from "@/components/admin/specialist-categories/specialist-category-form"

export default function NewSpecialistCategoryPage() {
  return (
    <div>
      <PageHeader title="Новая категория" />
      <SpecialistCategoryForm />
    </div>
  )
}
