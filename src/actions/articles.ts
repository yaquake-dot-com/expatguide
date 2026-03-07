"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { adminActionClient } from "@/lib/safe-action"
import { articleSchema, attachmentSchema } from "@/lib/validators/article"
import { createPendingChange, buildDiff } from "@/lib/moderation"
import { z } from "zod"

export const getArticles = async (filters?: {
  type?: string
  countryId?: string
  categoryId?: string
  status?: string
  countryScope?: string[] | null
}) => {
  const countryScope = filters?.countryScope
  return db.article.findMany({
    where: {
      ...(filters?.type ? { type: filters.type as "COUNTRY" | "GENERAL" } : {}),
      ...(filters?.countryId ? { countryId: filters.countryId } : {}),
      ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters?.status ? { status: filters.status as "DRAFT" | "PUBLISHED" } : {}),
      ...(countryScope ? { OR: [{ countryId: { in: countryScope } }, { countryId: null }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      country: { select: { name: true, flag: true } },
      category: { select: { name: true } },
      author: { select: { name: true } },
      _count: { select: { attachments: true } },
    },
  })
}

export const getArticleById = async (id: string) => {
  return db.article.findUnique({
    where: { id },
    include: {
      country: { select: { name: true, flag: true } },
      category: { select: { name: true } },
      author: { select: { name: true } },
      attachments: { orderBy: { sortOrder: "asc" } },
    },
  })
}

export const createArticle = adminActionClient
  .schema(articleSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { content, countryId, coverImage, ...rest } = parsedInput

    if (rest.type === "COUNTRY" && !countryId) {
      throw new Error("Для страновой статьи нужно выбрать страну")
    }

    const plainContent = JSON.parse(JSON.stringify(content))

    // CountryAdmin → validate country access + moderation queue
    if (!ctx.isSuperAdmin) {
      if (rest.type === "COUNTRY" && countryId && !ctx.userCountryIds.includes(countryId)) {
        throw new Error("Нет доступа к этой стране")
      }
      await createPendingChange({
        entityType: "ARTICLE",
        action: "CREATE",
        data: {
          ...rest,
          content: plainContent,
          coverImage: coverImage || null,
          countryId: rest.type === "COUNTRY" ? (countryId || null) : null,
          authorId: ctx.userId,
        },
        authorId: ctx.userId,
        countryId: rest.type === "COUNTRY" ? (countryId || null) : null,
      })
      return { id: null, pending: true }
    }

    const article = await db.article.create({
      data: {
        ...rest,
        content: plainContent,
        coverImage: coverImage || null,
        countryId: rest.type === "COUNTRY" ? (countryId || null) : null,
        authorId: ctx.userId,
        publishedAt: rest.status === "PUBLISHED" ? new Date() : null,
      },
    })

    revalidatePath("/admin/articles")
    return { id: article.id }
  })

export const updateArticle = adminActionClient
  .schema(articleSchema.extend({ id: z.string() }))
  .action(async ({ parsedInput: { id, content, countryId, coverImage, ...data }, ctx }) => {
    const existing = await db.article.findUnique({ where: { id } })
    if (!existing) throw new Error("Статья не найдена")

    const plainContent = JSON.parse(JSON.stringify(content))

    // CountryAdmin → validate country access + moderation queue with diff
    if (!ctx.isSuperAdmin) {
      if (existing.countryId && !ctx.userCountryIds.includes(existing.countryId)) {
        throw new Error("Нет доступа к этой стране")
      }
      if (data.type === "COUNTRY" && countryId && !ctx.userCountryIds.includes(countryId)) {
        throw new Error("Нет доступа к этой стране")
      }
      const oldData: Record<string, unknown> = {
        title: existing.title, slug: existing.slug,
        excerpt: existing.excerpt, type: existing.type,
        countryId: existing.countryId, categoryId: existing.categoryId,
        status: existing.status, coverImage: existing.coverImage,
      }
      const newData: Record<string, unknown> = {
        ...data, content: plainContent,
        coverImage: coverImage || null,
        countryId: data.type === "COUNTRY" ? (countryId || null) : null,
      }

      await createPendingChange({
        entityType: "ARTICLE",
        entityId: id,
        action: "UPDATE",
        data: { ...newData, authorId: existing.authorId },
        diff: buildDiff(oldData, newData),
        authorId: ctx.userId,
        countryId: data.type === "COUNTRY" ? (countryId || null) : null,
      })
      return { id, pending: true }
    }

    const article = await db.article.update({
      where: { id },
      data: {
        ...data,
        content: plainContent,
        coverImage: coverImage || null,
        countryId: data.type === "COUNTRY" ? (countryId || null) : null,
        publishedAt:
          data.status === "PUBLISHED" && existing.status !== "PUBLISHED"
            ? new Date()
            : existing.publishedAt,
      },
    })

    revalidatePath("/admin/articles")
    if (article.countryId) {
      revalidatePath(`/${article.countryId}`)
    }
    return { id: article.id }
  })

export const deleteArticle = adminActionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id }, ctx }) => {
    if (!ctx.isSuperAdmin) {
      const existing = await db.article.findUnique({ where: { id } })
      if (!existing) throw new Error("Статья не найдена")
      if (existing.countryId && !ctx.userCountryIds.includes(existing.countryId)) {
        throw new Error("Нет доступа к этой стране")
      }

      await createPendingChange({
        entityType: "ARTICLE",
        entityId: id,
        action: "DELETE",
        authorId: ctx.userId,
        countryId: existing.countryId,
      })
      return { pending: true }
    }

    await db.article.delete({ where: { id } })
    revalidatePath("/admin/articles")
  })

// ===== Attachments =====

export const getArticleAttachments = async (articleId: string) => {
  return db.articleAttachment.findMany({
    where: { articleId },
    orderBy: { sortOrder: "asc" },
  })
}

export const createAttachment = adminActionClient
  .schema(attachmentSchema.extend({ articleId: z.string() }))
  .action(async ({ parsedInput: { articleId, ...data } }) => {
    const attachment = await db.articleAttachment.create({
      data: { ...data, articleId },
    })
    revalidatePath("/admin/articles")
    return { id: attachment.id }
  })

export const deleteAttachment = adminActionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id } }) => {
    await db.articleAttachment.delete({ where: { id } })
    revalidatePath("/admin/articles")
  })
