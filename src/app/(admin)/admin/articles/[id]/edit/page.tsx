import { notFound } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { BreadcrumbSetter } from "@/components/admin/breadcrumb-setter"
import { ArticleForm } from "@/components/admin/articles/article-form"
import { AttachmentManager } from "@/components/admin/articles/attachment-manager"
import { getArticleById } from "@/actions/articles"
import { getUserCountryScope } from "@/lib/safe-action"
import { db } from "@/lib/db"

interface EditArticlePageProps {
  params: Promise<{ id: string }>
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params
  const article = await getArticleById(id)

  if (!article) notFound()

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
    <div className="space-y-6">
      <BreadcrumbSetter id={article.id} label={article.title} />
      <PageHeader title={`Редактировать: ${article.title}`} />
      <ArticleForm
        countries={countries}
        categories={categories}
        initialData={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content as Record<string, unknown>,
          coverImage: article.coverImage,
          type: article.type,
          countryId: article.countryId,
          categoryId: article.categoryId,
          status: article.status,
          attachmentsPosition: article.attachmentsPosition,
        }}
      />
      <AttachmentManager
        articleId={article.id}
        attachments={article.attachments.map((a) => ({
          id: a.id,
          label: a.label,
          type: a.type,
          url: a.url,
          platform: a.platform,
          fileSize: a.fileSize,
          version: a.version,
          sortOrder: a.sortOrder,
          downloads: a.downloads,
        }))}
      />
    </div>
  )
}
