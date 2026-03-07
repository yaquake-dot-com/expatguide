"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { superAdminActionClient } from "@/lib/safe-action"
import { countryActionSchema } from "@/lib/validators/country"
import { z } from "zod"

export const getCountries = async () => {
  return db.country.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: {
          cities: true,
          specialists: true,
          articles: true,
        },
      },
    },
  })
}

export const getCountryById = async (id: string) => {
  return db.country.findUnique({ where: { id } })
}

export const createCountry = superAdminActionClient
  .schema(countryActionSchema)
  .action(async ({ parsedInput }) => {
    const country = await db.country.create({
      data: parsedInput,
    })
    revalidatePath("/admin/countries")
    return country
  })

export const updateCountry = superAdminActionClient
  .schema(countryActionSchema.extend({ id: z.string() }))
  .action(async ({ parsedInput: { id, ...data } }) => {
    const country = await db.country.update({
      where: { id },
      data,
    })
    revalidatePath("/admin/countries")
    revalidatePath(`/${country.slug}`)
    return country
  })

export const deleteCountry = superAdminActionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id } }) => {
    await db.country.delete({ where: { id } })
    revalidatePath("/admin/countries")
  })
