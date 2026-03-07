import { PageHeader } from "@/components/admin/page-header"
import { ArticleCategoryForm } from "@/components/admin/article-categories/article-category-form"

export default function NewArticleCategoryPage() {
  return (
    <div>
      <PageHeader title="Новая категория статей" />
      <ArticleCategoryForm />
    </div>
  )
}
