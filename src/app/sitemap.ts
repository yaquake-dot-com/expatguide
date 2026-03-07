import type { MetadataRoute } from "next"
import { db } from "@/lib/db"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://expatguide.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const countries = await db.country.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  })

  const articles = await db.article.findMany({
    where: { status: "PUBLISHED" },
    select: {
      slug: true,
      updatedAt: true,
      country: { select: { slug: true } },
    },
  })

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ]

  const countryRoutes: MetadataRoute.Sitemap = countries.flatMap((country) => [
    {
      url: `${BASE_URL}/${country.slug}`,
      lastModified: country.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/${country.slug}/directory`,
      lastModified: country.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/${country.slug}/articles`,
      lastModified: country.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/${country.slug}/links`,
      lastModified: country.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ])

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${BASE_URL}/${article.country?.slug || "general"}/articles/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...countryRoutes, ...articleRoutes]
}
