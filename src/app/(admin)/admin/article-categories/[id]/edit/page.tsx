import { notFound } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { ArticleCategoryForm } from "@/components/admin/article-categories/article-category-form"
import { getArticleCategoryById } from "@/actions/article-categories"

interface EditArticleCategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditArticleCategoryPage({ params }: EditArticleCategoryPageProps) {
  const { id } = await params
  const category = await getArticleCategoryById(id)

  if (!category) notFound()

  return (
    <div>
      <PageHeader title={`Редактировать: ${category.name}`} />
      <ArticleCategoryForm
        initialData={{
          id: category.id,
          name: category.name,
          slug: category.slug,
        }}
      />
    </div>
  )
}
