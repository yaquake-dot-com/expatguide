"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { adminActionClient } from "@/lib/safe-action"
import { citySchema } from "@/lib/validators/city"
import { z } from "zod"

export const getCities = async (countryId?: string, countryScope?: string[] | null) => {
  return db.city.findMany({
    where: {
      ...(countryId ? { countryId } : {}),
      ...(countryScope ? { countryId: { in: countryScope } } : {}),
    },
    orderBy: { name: "asc" },
    include: {
      country: { select: { name: true, flag: true, slug: true } },
      _count: { select: { specialists: true } },
    },
  })
}

export const getCityById = async (id: string) => {
  return db.city.findUnique({
    where: { id },
    include: { country: { select: { name: true } } },
  })
}

export const createCity = adminActionClient
  .schema(citySchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx.isSuperAdmin && !ctx.userCountryIds.includes(parsedInput.countryId)) {
      throw new Error("Нет доступа к этой стране")
    }
    const city = await db.city.create({ data: parsedInput })
    revalidatePath("/admin/cities")
    return city
  })

export const updateCity = adminActionClient
  .schema(citySchema.extend({ id: z.string() }))
  .action(async ({ parsedInput: { id, ...data }, ctx }) => {
    if (!ctx.isSuperAdmin && !ctx.userCountryIds.includes(data.countryId)) {
      throw new Error("Нет доступа к этой стране")
    }
    const city = await db.city.update({ where: { id }, data })
    revalidatePath("/admin/cities")
    return city
  })

export const deleteCity = adminActionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id }, ctx }) => {
    if (!ctx.isSuperAdmin) {
      const existing = await db.city.findUnique({ where: { id } })
      if (!existing || !ctx.userCountryIds.includes(existing.countryId)) {
        throw new Error("Нет доступа к этой стране")
      }
    }
    await db.city.delete({ where: { id } })
    revalidatePath("/admin/cities")
  })
