import { PageHeader } from "@/components/admin/page-header"
import { DataTable } from "@/components/admin/data-table"
import { specialistCategoriesColumns } from "@/components/admin/specialist-categories/specialist-categories-columns"
import { getSpecialistCategories } from "@/actions/specialist-categories"

export default async function SpecialistCategoriesPage() {
  const categories = await getSpecialistCategories()

  return (
    <div>
      <PageHeader
        title="Категории специалистов"
        description="Управление категориями справочника"
        createHref="/admin/specialist-categories/new"
        createLabel="Добавить категорию"
      />
      <DataTable
        columns={specialistCategoriesColumns}
        data={categories}
        searchKey="name"
        searchPlaceholder="Поиск по названию..."
      />
    </div>
  )
}
