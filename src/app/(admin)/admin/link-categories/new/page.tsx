import { PageHeader } from "@/components/admin/page-header"
import { LinkCategoryForm } from "@/components/admin/link-categories/link-category-form"

export default function NewLinkCategoryPage() {
  return (
    <div>
      <PageHeader title="Новая категория ссылок" />
      <LinkCategoryForm />
    </div>
  )
}
