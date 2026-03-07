"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { adminActionClient } from "@/lib/safe-action"
import { specialistSchema } from "@/lib/validators/specialist"
import { createPendingChange, buildDiff } from "@/lib/moderation"
import { z } from "zod"

export const getSpecialists = async (filters?: {
  countryId?: string
  cityId?: string
  categoryId?: string
  countryScope?: string[] | null
}) => {
  const countryScope = filters?.countryScope
  return db.specialist.findMany({
    where: {
      ...(filters?.countryId ? { countryId: filters.countryId } : {}),
      ...(filters?.cityId ? { cityId: filters.cityId } : {}),
      ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(countryScope ? { countryId: { in: countryScope } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      country: { select: { name: true, flag: true } },
      city: { select: { name: true } },
      category: { select: { name: true } },
    },
  })
}

export const getSpecialistById = async (id: string) => {
  return db.specialist.findUnique({
    where: { id },
    include: {
      country: { select: { name: true, flag: true } },
      city: { select: { name: true } },
      category: { select: { name: true } },
    },
  })
}

export const createSpecialist = adminActionClient
  .schema(specialistSchema)
  .action(async ({ parsedInput, ctx }) => {
    // CountryAdmin → validate country access + moderation queue
    if (!ctx.isSuperAdmin) {
      if (!ctx.userCountryIds.includes(parsedInput.countryId)) {
        throw new Error("Нет доступа к этой стране")
      }
      await createPendingChange({
        entityType: "SPECIALIST",
        action: "CREATE",
        data: parsedInput as unknown as Record<string, unknown>,
        authorId: ctx.userId,
        countryId: parsedInput.countryId,
      })
      return { id: null, pending: true }
    }

    const { socialLinks, ...rest } = parsedInput
    const specialist = await db.specialist.create({
      data: {
        ...rest,
        cityId: rest.cityId || null,
        socialLinks: socialLinks ?? undefined,
      },
    })
    revalidatePath("/admin/specialists")
    return { id: specialist.id }
  })

export const updateSpecialist = adminActionClient
  .schema(specialistSchema.extend({ id: z.string() }))
  .action(async ({ parsedInput: { id, socialLinks, ...data }, ctx }) => {
    // CountryAdmin → validate country access + moderation queue with diff
    if (!ctx.isSuperAdmin) {
      const existing = await db.specialist.findUnique({ where: { id } })
      if (!existing) throw new Error("Специалист не найден")
      if (!ctx.userCountryIds.includes(existing.countryId)) {
        throw new Error("Нет доступа к этой стране")
      }
      if (!ctx.userCountryIds.includes(data.countryId)) {
        throw new Error("Нет доступа к этой стране")
      }

      const oldData: Record<string, unknown> = {
        name: existing.name, description: existing.description,
        phone: existing.phone, email: existing.email,
        website: existing.website, address: existing.address,
        image: existing.image, countryId: existing.countryId,
        cityId: existing.cityId, categoryId: existing.categoryId,
        languages: existing.languages, isActive: existing.isActive,
      }
      const newData: Record<string, unknown> = { ...data, socialLinks }

      await createPendingChange({
        entityType: "SPECIALIST",
        entityId: id,
        action: "UPDATE",
        data: { ...data, socialLinks },
        diff: buildDiff(oldData, newData),
        authorId: ctx.userId,
        countryId: data.countryId,
      })
      return { id, pending: true }
    }

    const specialist = await db.specialist.update({
      where: { id },
      data: {
        ...data,
        cityId: data.cityId || null,
        socialLinks: socialLinks ?? undefined,
      },
    })
    revalidatePath("/admin/specialists")
    return { id: specialist.id }
  })

export const deleteSpecialist = adminActionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id }, ctx }) => {
    // CountryAdmin → validate country access + moderation queue
    if (!ctx.isSuperAdmin) {
      const existing = await db.specialist.findUnique({ where: { id } })
      if (!existing) throw new Error("Специалист не найден")
      if (!ctx.userCountryIds.includes(existing.countryId)) {
        throw new Error("Нет доступа к этой стране")
      }

      await createPendingChange({
        entityType: "SPECIALIST",
        entityId: id,
        action: "DELETE",
        authorId: ctx.userId,
        countryId: existing.countryId,
      })
      return { pending: true }
    }

    await db.specialist.delete({ where: { id } })
    revalidatePath("/admin/specialists")
  })
