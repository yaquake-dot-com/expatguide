"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { adminActionClient } from "@/lib/safe-action"
import { linkActionSchema } from "@/lib/validators/link"
import { createPendingChange, buildDiff } from "@/lib/moderation"
import { z } from "zod"

export const getLinks = async (filters?: {
  countryId?: string
  categoryId?: string
  countryScope?: string[] | null
}) => {
  const countryScope = filters?.countryScope
  return db.usefulLink.findMany({
    where: {
      ...(filters?.countryId ? { countryId: filters.countryId } : {}),
      ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(countryScope ? { OR: [{ countryId: { in: countryScope } }, { countryId: null }] } : {}),
    },
    orderBy: { sortOrder: "asc" },
    include: {
      country: { select: { name: true, flag: true } },
      category: { select: { name: true } },
    },
  })
}

export const getLinkById = async (id: string) => {
  return db.usefulLink.findUnique({ where: { id } })
}

export const createLink = adminActionClient
  .schema(linkActionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { countryId, icon, description, ...rest } = parsedInput

    // CountryAdmin → validate country access + moderation queue
    if (!ctx.isSuperAdmin) {
      if (countryId && !ctx.userCountryIds.includes(countryId)) {
        throw new Error("Нет доступа к этой стране")
      }
      await createPendingChange({
        entityType: "USEFUL_LINK",
        action: "CREATE",
        data: {
          ...rest,
          description: description || null,
          icon: icon || null,
          countryId: countryId || null,
        } as unknown as Record<string, unknown>,
        authorId: ctx.userId,
        countryId: countryId || null,
      })
      return { id: null, pending: true }
    }

    const link = await db.usefulLink.create({
      data: {
        ...rest,
        description: description || null,
        icon: icon || null,
        countryId: countryId || null,
      },
    })
    revalidatePath("/admin/links")
    return { id: link.id }
  })

export const updateLink = adminActionClient
  .schema(linkActionSchema.extend({ id: z.string() }))
  .action(async ({ parsedInput: { id, countryId, icon, description, ...data }, ctx }) => {
    // CountryAdmin → validate country access + moderation queue with diff
    if (!ctx.isSuperAdmin) {
      const existing = await db.usefulLink.findUnique({ where: { id } })
      if (!existing) throw new Error("Ссылка не найдена")
      if (existing.countryId && !ctx.userCountryIds.includes(existing.countryId)) {
        throw new Error("Нет доступа к этой стране")
      }
      if (countryId && !ctx.userCountryIds.includes(countryId)) {
        throw new Error("Нет доступа к этой стране")
      }

      const oldData: Record<string, unknown> = {
        title: existing.title, url: existing.url,
        description: existing.description, icon: existing.icon,
        countryId: existing.countryId, categoryId: existing.categoryId,
        sortOrder: existing.sortOrder, isActive: existing.isActive,
      }
      const newData: Record<string, unknown> = {
        ...data, description: description || null,
        icon: icon || null, countryId: countryId || null,
      }

      await createPendingChange({
        entityType: "USEFUL_LINK",
        entityId: id,
        action: "UPDATE",
        data: newData,
        diff: buildDiff(oldData, newData),
        authorId: ctx.userId,
        countryId: countryId || null,
      })
      return { id, pending: true }
    }

    const link = await db.usefulLink.update({
      where: { id },
      data: {
        ...data,
        description: description || null,
        icon: icon || null,
        countryId: countryId || null,
      },
    })
    revalidatePath("/admin/links")
    return { id: link.id }
  })

export const deleteLink = adminActionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id }, ctx }) => {
    if (!ctx.isSuperAdmin) {
      const existing = await db.usefulLink.findUnique({ where: { id } })
      if (!existing) throw new Error("Ссылка не найдена")
      if (existing.countryId && !ctx.userCountryIds.includes(existing.countryId)) {
        throw new Error("Нет доступа к этой стране")
      }

      await createPendingChange({
        entityType: "USEFUL_LINK",
        entityId: id,
        action: "DELETE",
        authorId: ctx.userId,
        countryId: existing.countryId,
      })
      return { pending: true }
    }

    await db.usefulLink.delete({ where: { id } })
    revalidatePath("/admin/links")
  })
