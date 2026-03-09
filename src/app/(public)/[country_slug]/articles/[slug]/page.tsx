import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { TipTapRenderer } from "@/components/editor/tiptap-renderer"
import { ShareButtons } from "@/components/shared/share-buttons"
import { ArticleCard } from "@/components/shared/article-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, User, Download, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import type { JSONContent } from "@tiptap/react"
import { JsonLd } from "@/components/shared/json-ld"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { TableOfContents } from "@/components/shared/table-of-contents"

interface Props {
  params: Promise<{ country_slug: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country_slug, slug } = await params
  const article = await db.article.findUnique({
    where: { slug },
    include: { author: { select: { name: true, nickname: true } } },
  })
  if (!article) return {}
  const url = `/${country_slug}/articles/${slug}`
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author.name],
      ...(article.coverImage ? { images: [article.coverImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      ...(article.coverImage ? { images: [article.coverImage] } : {}),
    },
    alternates: { canonical: url },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { country_slug, slug } = await params

  const article = await db.article.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: { select: { name: true, slug: true } },
      country: { select: { name: true, flag: true } },
      author: { select: { name: true, nickname: true } },
      attachments: { orderBy: { sortOrder: "asc" } },
    },
  })

  if (!article) notFound()

  // Related articles — same country first, then general, then any
  const relatedInclude = {
    category: { select: { name: true } },
    country: { select: { name: true, flag: true, slug: true } },
  } as const

  // 1. Same country + same category
  let related = await db.article.findMany({
    where: {
      status: "PUBLISHED",
      countryId: article.countryId,
      categoryId: article.categoryId,
      id: { not: article.id },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: relatedInclude,
  })

  // 2. Same country, any category
  if (related.length < 3) {
    const excludeIds = [article.id, ...related.map((a) => a.id)]
    const filler = await db.article.findMany({
      where: {
        status: "PUBLISHED",
        countryId: article.countryId,
        id: { notIn: excludeIds },
      },
      orderBy: { publishedAt: "desc" },
      take: 3 - related.length,
      include: relatedInclude,
    })
    related = [...related, ...filler]
  }

  // 3. General articles (no country) or any remaining
  if (related.length < 3) {
    const excludeIds = [article.id, ...related.map((a) => a.id)]
    const filler = await db.article.findMany({
      where: {
        status: "PUBLISHED",
        id: { notIn: excludeIds },
        OR: [{ countryId: null }, { type: "GENERAL" }],
      },
      orderBy: { publishedAt: "desc" },
      take: 3 - related.length,
      include: relatedInclude,
    })
    related = [...related, ...filler]
  }

  const showAttachmentsTop = article.attachmentsPosition === "TOP" || article.attachmentsPosition === "BOTH"
  const showAttachmentsBottom = article.attachmentsPosition === "BOTTOM" || article.attachmentsPosition === "BOTH"

  const attachmentsBlock = article.attachments.length > 0 && (
    <Card>
      <CardContent className="p-4">
        <h3 className="mb-3 font-semibold">Вложения и загрузки</h3>
        <div className="space-y-2">
          {article.attachments.map((att) => (
            <a
              key={att.id}
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              {att.type === "FILE" ? (
                <Download className="h-5 w-5 text-primary" />
              ) : (
                <ExternalLink className="h-5 w-5 text-primary" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium">{att.label}</p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {att.platform && <span>{att.platform}</span>}
                  {att.version && <span>v{att.version}</span>}
                  {att.fileSize && (
                    <span>{(att.fileSize / 1024 / 1024).toFixed(1)} МБ</span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: { "@type": "Person", name: article.author.nickname || article.author.name },
    ...(article.publishedAt ? { datePublished: article.publishedAt.toISOString() } : {}),
    dateModified: article.updatedAt.toISOString(),
    publisher: { "@type": "Organization", name: "Переехали" },
    url: `${baseUrl}/${country_slug}/articles/${slug}`,
    ...(article.coverImage ? { image: article.coverImage } : {}),
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <JsonLd data={articleJsonLd} />
      <Breadcrumbs items={[
        { label: article.country?.name || "Главная", href: `/${country_slug}` },
        { label: "Статьи", href: `/${country_slug}/articles${article.type === "GENERAL" ? "?type=GENERAL" : "?type=COUNTRY"}` },
        { label: article.title },
      ]} />

      {/* Header */}
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{article.category.name}</Badge>
            {article.country && (
              <Badge variant="outline">
                {article.country.flag} {article.country.name}
              </Badge>
            )}
          </div>
          <ShareButtons
            url={`${baseUrl}/${country_slug}/articles/${slug}`}
            title={article.title}
          />
        </div>

        <h1 className="mb-4 text-3xl font-bold font-heading md:text-4xl">
          {article.title}
        </h1>

        <p className="mb-4 text-lg text-muted-foreground">{article.excerpt}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {article.author.nickname || article.author.name}
          </span>
          {article.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(article.publishedAt), "d MMMM yyyy", { locale: ru })}
            </span>
          )}
        </div>

        <hr className="mt-6 border-border" />
      </header>

      {/* Cover image */}
      {article.coverImage && (
        <div className="relative mb-8 aspect-[2/1] overflow-hidden rounded-xl">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Attachments TOP */}
      {showAttachmentsTop && <div className="mb-8">{attachmentsBlock}</div>}

      {/* Table of Contents */}
      <TableOfContents content={article.content as JSONContent} />

      {/* Article content */}
      <article className="mb-8">
        <TipTapRenderer content={article.content as JSONContent} />
      </article>

      {/* Attachments BOTTOM */}
      {showAttachmentsBottom && <div className="mb-8">{attachmentsBlock}</div>}

      {/* Related articles */}
      {related.length > 0 && (
        <section className="border-t pt-8">
          <h2 className="mb-4 text-2xl font-bold font-heading">
            Читайте также
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard
                key={a.id}
                title={a.title}
                slug={a.slug}
                excerpt={a.excerpt}
                coverImage={a.coverImage}
                categoryName={a.category.name}
                countrySlug={country_slug}
                countryName={a.country?.name}
                countryFlag={a.country?.flag}
                publishedAt={a.publishedAt}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
