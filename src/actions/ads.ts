"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { adminActionClient } from "@/lib/safe-action"
import { adSchema } from "@/lib/validators/ad"
import { createPendingChange, buildDiff } from "@/lib/moderation"
import { z } from "zod"

export const getAds = async (filters?: {
  slot?: string
  countryId?: string
  countryScope?: string[] | null
}) => {
  const countryScope = filters?.countryScope
  return db.advertisement.findMany({
    where: {
      ...(filters?.slot ? { slot: filters.slot as "HERO_BANNER" | "SIDEBAR" } : {}),
      ...(filters?.countryId ? { countryId: filters.countryId } : {}),
      ...(countryScope ? { OR: [{ countryId: { in: countryScope } }, { countryId: null }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      country: { select: { name: true, flag: true } },
    },
  })
}

export const getAdById = async (id: string) => {
  return db.advertisement.findUnique({ where: { id } })
}

export const createAd = adminActionClient
  .schema(adSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { countryId, imageUrl, htmlContent, startsAt, endsAt, ...rest } = parsedInput
    const start = new Date(startsAt)
    const end = new Date(endsAt)
    if (end <= start) throw new Error("Дата окончания должна быть позже даты начала")

    // CountryAdmin → validate country access + moderation queue
    if (!ctx.isSuperAdmin) {
      if (countryId && !ctx.userCountryIds.includes(countryId)) {
        throw new Error("Нет доступа к этой стране")
      }
      await createPendingChange({
        entityType: "ADVERTISEMENT",
        action: "CREATE",
        data: {
          ...rest,
          imageUrl: imageUrl || null,
          htmlContent: htmlContent || null,
          countryId: countryId || null,
          startsAt, endsAt,
        } as unknown as Record<string, unknown>,
        authorId: ctx.userId,
        countryId: countryId || null,
      })
      return { id: null, pending: true }
    }

    const ad = await db.advertisement.create({
      data: {
        ...rest,
        imageUrl: imageUrl || null,
        htmlContent: htmlContent || null,
        countryId: countryId || null,
        startsAt: start,
        endsAt: end,
      },
    })
    revalidatePath("/admin/ads")
    return { id: ad.id }
  })

export const updateAd = adminActionClient
  .schema(adSchema.extend({ id: z.string() }))
  .action(async ({ parsedInput: { id, countryId, imageUrl, htmlContent, startsAt, endsAt, ...data }, ctx }) => {
    const start = new Date(startsAt)
    const end = new Date(endsAt)
    if (end <= start) throw new Error("Дата окончания должна быть позже даты начала")

    // CountryAdmin → validate country access + moderation queue with diff
    if (!ctx.isSuperAdmin) {
      const existing = await db.advertisement.findUnique({ where: { id } })
      if (!existing) throw new Error("Баннер не найден")
      if (existing.countryId && !ctx.userCountryIds.includes(existing.countryId)) {
        throw new Error("Нет доступа к этой стране")
      }
      if (countryId && !ctx.userCountryIds.includes(countryId)) {
        throw new Error("Нет доступа к этой стране")
      }

      const oldData: Record<string, unknown> = {
        title: existing.title, targetUrl: existing.targetUrl,
        imageUrl: existing.imageUrl, htmlContent: existing.htmlContent,
        slot: existing.slot, countryId: existing.countryId,
        startsAt: existing.startsAt.toISOString(),
        endsAt: existing.endsAt.toISOString(),
        isActive: existing.isActive,
      }
      const newData: Record<string, unknown> = {
        ...data, imageUrl: imageUrl || null,
        htmlContent: htmlContent || null,
        countryId: countryId || null, startsAt, endsAt,
      }

      await createPendingChange({
        entityType: "ADVERTISEMENT",
        entityId: id,
        action: "UPDATE",
        data: newData,
        diff: buildDiff(oldData, newData),
        authorId: ctx.userId,
        countryId: countryId || null,
      })
      return { id, pending: true }
    }

    const ad = await db.advertisement.update({
      where: { id },
      data: {
        ...data,
        imageUrl: imageUrl || null,
        htmlContent: htmlContent || null,
        countryId: countryId || null,
        startsAt: start,
        endsAt: end,
      },
    })
    revalidatePath("/admin/ads")
    return { id: ad.id }
  })

export const deleteAd = adminActionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id }, ctx }) => {
    if (!ctx.isSuperAdmin) {
      const existing = await db.advertisement.findUnique({ where: { id } })
      if (!existing) throw new Error("Баннер не найден")
      if (existing.countryId && !ctx.userCountryIds.includes(existing.countryId)) {
        throw new Error("Нет доступа к этой стране")
      }

      await createPendingChange({
        entityType: "ADVERTISEMENT",
        entityId: id,
        action: "DELETE",
        authorId: ctx.userId,
        countryId: existing.countryId,
      })
      return { pending: true }
    }

    await db.advertisement.delete({ where: { id } })
    revalidatePath("/admin/ads")
  })
