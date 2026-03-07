import { createSafeActionClient } from "next-safe-action"
import { auth } from "./auth"
import { db } from "./db"

export const actionClient = createSafeActionClient()

/**
 * Returns the list of country IDs the current user has access to,
 * or null if the user is a SUPER_ADMIN (has access to all).
 */
export async function getUserCountryScope(): Promise<string[] | null> {
  const session = await auth()
  if (!session?.user) return []
  if (session.user.role === "SUPER_ADMIN") return null // all countries

  const userCountries = await db.userCountry.findMany({
    where: { userId: session.user.id },
    select: { countryId: true },
  })
  return userCountries.map((uc) => uc.countryId)
}

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Необходима авторизация")
  }

  return next({ ctx: { session } })
})

export const adminActionClient = authActionClient.use(async ({ next, ctx }) => {
  const role = ctx.session.user.role
  if (role !== "SUPER_ADMIN" && role !== "COUNTRY_ADMIN") {
    throw new Error("Недостаточно прав")
  }

  // For CountryAdmin, load their assigned country IDs
  let userCountryIds: string[] = []
  if (role === "COUNTRY_ADMIN") {
    const userCountries = await db.userCountry.findMany({
      where: { userId: ctx.session.user.id! },
      select: { countryId: true },
    })
    userCountryIds = userCountries.map((uc) => uc.countryId)
  }

  return next({
    ctx: {
      ...ctx,
      role: role as "SUPER_ADMIN" | "COUNTRY_ADMIN",
      userId: ctx.session.user.id!,
      userCountryIds,
      isSuperAdmin: role === "SUPER_ADMIN",
    },
  })
})

export const superAdminActionClient = authActionClient.use(async ({ next, ctx }) => {
  if (ctx.session.user.role !== "SUPER_ADMIN") {
    throw new Error("Только для суперадминистратора")
  }

  return next({ ctx: { ...ctx, userId: ctx.session.user.id! } })
})
