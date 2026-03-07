import { Suspense } from "react"
import { PageHeader } from "@/components/admin/page-header"
import { DataTable } from "@/components/admin/data-table"
import { articlesColumns } from "@/components/admin/articles/articles-columns"
import { ArticlesFilters } from "@/components/admin/articles/articles-filters"
import { getArticles } from "@/actions/articles"
import { getUserCountryScope } from "@/lib/safe-action"
import { db } from "@/lib/db"

interface ArticlesPageProps {
  searchParams: Promise<{
    type?: string
    countryId?: string
    categoryId?: string
    status?: string
  }>
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const filters = await searchParams
  const countryScope = await getUserCountryScope()

  const [articles, countries, categories] = await Promise.all([
    getArticles({ ...filters, countryScope }),
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
      <PageHeader
        title="Статьи"
        description="Управление контентом портала"
        createHref="/admin/articles/new"
        createLabel="Новая статья"
      />
      <div className="mb-4">
        <Suspense>
          <ArticlesFilters countries={countries} categories={categories} />
        </Suspense>
      </div>
      <DataTable
        columns={articlesColumns}
        data={articles}
        searchKey="title"
        searchPlaceholder="Поиск по заголовку..."
      />
    </div>
  )
}
