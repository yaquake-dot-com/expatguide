"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { superAdminActionClient } from "@/lib/safe-action"
import { linkCategorySchema } from "@/lib/validators/link-category"
import { z } from "zod"

export const getLinkCategories = async () => {
  return db.linkCategory.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { links: true } },
    },
  })
}

export const getLinkCategoryById = async (id: string) => {
  return db.linkCategory.findUnique({ where: { id } })
}

export const createLinkCategory = superAdminActionClient
  .schema(linkCategorySchema)
  .action(async ({ parsedInput }) => {
    const category = await db.linkCategory.create({ data: parsedInput })
    revalidatePath("/admin/link-categories")
    return { id: category.id }
  })

export const updateLinkCategory = superAdminActionClient
  .schema(linkCategorySchema.extend({ id: z.string() }))
  .action(async ({ parsedInput: { id, ...data } }) => {
    const category = await db.linkCategory.update({ where: { id }, data })
    revalidatePath("/admin/link-categories")
    return { id: category.id }
  })

export const deleteLinkCategory = superAdminActionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id } }) => {
    const count = await db.usefulLink.count({ where: { categoryId: id } })
    if (count > 0) {
      throw new Error(`Невозможно удалить: ${count} ссылок используют эту категорию`)
    }
    await db.linkCategory.delete({ where: { id } })
    revalidatePath("/admin/link-categories")
  })
