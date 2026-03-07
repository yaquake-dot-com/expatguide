"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { superAdminActionClient } from "@/lib/safe-action"
import { updateThemeSchema } from "@/lib/validators/settings"
import { invalidateThemeCache } from "@/lib/theme"

export const getSiteSettings = async () => {
  const settings = await db.siteSettings.findUnique({
    where: { id: "singleton" },
  })
  return settings ?? { id: "singleton", theme: "default" as string, updatedAt: new Date() }
}

export const updateTheme = superAdminActionClient
  .schema(updateThemeSchema)
  .action(async ({ parsedInput }) => {
    const settings = await db.siteSettings.upsert({
      where: { id: "singleton" },
      update: { theme: parsedInput.theme },
      create: { id: "singleton", theme: parsedInput.theme },
    })

    invalidateThemeCache()
    revalidatePath("/", "layout")

    return settings
  })
