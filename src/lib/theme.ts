import { db } from "./db"
import { cache } from "react"

export type ThemeName = "default" | "neobrutalism"

const CACHE_TTL = 60_000 // 60 seconds

const themeCache = globalThis as unknown as {
  __themeCache?: { value: ThemeName; expiresAt: number }
}

export const getTheme = cache(async (): Promise<ThemeName> => {
  // Check in-memory cache
  if (themeCache.__themeCache && Date.now() < themeCache.__themeCache.expiresAt) {
    return themeCache.__themeCache.value
  }

  // Read from DB
  const settings = await db.siteSettings.findUnique({
    where: { id: "singleton" },
  })

  const theme = (settings?.theme as ThemeName) || "default"

  // Store in memory cache
  themeCache.__themeCache = {
    value: theme,
    expiresAt: Date.now() + CACHE_TTL,
  }

  return theme
})

export function invalidateThemeCache() {
  themeCache.__themeCache = undefined
}
