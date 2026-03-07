import { PageHeader } from "@/components/admin/page-header"
import { DataTable } from "@/components/admin/data-table"
import { articleCategoriesColumns } from "@/components/admin/article-categories/article-categories-columns"
import { getArticleCategories } from "@/actions/article-categories"

export default async function ArticleCategoriesPage() {
  const categories = await getArticleCategories()

  return (
    <div>
      <PageHeader
        title="Категории статей"
        description="Управление категориями контента"
        createHref="/admin/article-categories/new"
        createLabel="Добавить категорию"
      />
      <DataTable
        columns={articleCategoriesColumns}
        data={categories}
        searchKey="name"
        searchPlaceholder="Поиск по названию..."
      />
    </div>
  )
}
