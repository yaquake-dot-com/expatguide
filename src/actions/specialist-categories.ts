"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { superAdminActionClient } from "@/lib/safe-action"
import { specialistCategoryActionSchema } from "@/lib/validators/specialist-category"
import { z } from "zod"

export const getSpecialistCategories = async () => {
  return db.specialistCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { specialists: true } },
    },
  })
}

export const getSpecialistCategoryById = async (id: string) => {
  return db.specialistCategory.findUnique({ where: { id } })
}

export const createSpecialistCategory = superAdminActionClient
  .schema(specialistCategoryActionSchema)
  .action(async ({ parsedInput }) => {
    const category = await db.specialistCategory.create({
      data: parsedInput,
    })
    revalidatePath("/admin/specialist-categories")
    return category
  })

export const updateSpecialistCategory = superAdminActionClient
  .schema(specialistCategoryActionSchema.extend({ id: z.string() }))
  .action(async ({ parsedInput: { id, ...data } }) => {
    const category = await db.specialistCategory.update({
      where: { id },
      data,
    })
    revalidatePath("/admin/specialist-categories")
    return category
  })

export const deleteSpecialistCategory = superAdminActionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id } }) => {
    // Check if any specialists use this category
    const count = await db.specialist.count({ where: { categoryId: id } })
    if (count > 0) {
      throw new Error(`Невозможно удалить: ${count} специалистов используют эту категорию`)
    }
    await db.specialistCategory.delete({ where: { id } })
    revalidatePath("/admin/specialist-categories")
  })
