"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { superAdminActionClient } from "@/lib/safe-action"
import { articleCategorySchema } from "@/lib/validators/article-category"
import { z } from "zod"

export const getArticleCategories = async () => {
  return db.articleCategory.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { articles: true } },
    },
  })
}

export const getArticleCategoryById = async (id: string) => {
  return db.articleCategory.findUnique({ where: { id } })
}

export const createArticleCategory = superAdminActionClient
  .schema(articleCategorySchema)
  .action(async ({ parsedInput }) => {
    const category = await db.articleCategory.create({ data: parsedInput })
    revalidatePath("/admin/article-categories")
    return category
  })

export const updateArticleCategory = superAdminActionClient
  .schema(articleCategorySchema.extend({ id: z.string() }))
  .action(async ({ parsedInput: { id, ...data } }) => {
    const category = await db.articleCategory.update({ where: { id }, data })
    revalidatePath("/admin/article-categories")
    return category
  })

export const deleteArticleCategory = superAdminActionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id } }) => {
    const count = await db.article.count({ where: { categoryId: id } })
    if (count > 0) {
      throw new Error(`Невозможно удалить: ${count} статей используют эту категорию`)
    }
    await db.articleCategory.delete({ where: { id } })
    revalidatePath("/admin/article-categories")
  })
