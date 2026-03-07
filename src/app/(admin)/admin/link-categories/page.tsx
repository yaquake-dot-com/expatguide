import { PageHeader } from "@/components/admin/page-header"
import { DataTable } from "@/components/admin/data-table"
import { linkCategoriesColumns } from "@/components/admin/link-categories/link-categories-columns"
import { getLinkCategories } from "@/actions/link-categories"

export default async function LinkCategoriesPage() {
  const categories = await getLinkCategories()

  return (
    <div>
      <PageHeader
        title="Категории ссылок"
        description="Управление категориями полезных ссылок"
        createHref="/admin/link-categories/new"
        createLabel="Добавить категорию"
      />
      <DataTable columns={linkCategoriesColumns} data={categories} searchKey="name" searchPlaceholder="Поиск по названию..." />
    </div>
  )
}
