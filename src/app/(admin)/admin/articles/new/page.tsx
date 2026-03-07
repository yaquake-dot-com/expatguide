import { PageHeader } from "@/components/admin/page-header"
import { ArticleForm } from "@/components/admin/articles/article-form"
import { getUserCountryScope } from "@/lib/safe-action"
import { db } from "@/lib/db"

export default async function NewArticlePage() {
  const countryScope = await getUserCountryScope()
  const [countries, categories] = await Promise.all([
    db.country.findMany({
      where: {
        isActive: true,
        ...(countryScope ? { id: { in: countryScope } } : {}),
      },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, flag: true },
    }),
    db.articleCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ])

  return (
    <div>
      <PageHeader title="Новая статья" />
      <ArticleForm countries={countries} categories={categories} />
    </div>
  )
}
