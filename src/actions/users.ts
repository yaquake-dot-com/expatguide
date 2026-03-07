"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { superAdminActionClient } from "@/lib/safe-action"
import { createUserSchema, updateUserSchema } from "@/lib/validators/user"
import { z } from "zod"
import { hash } from "bcryptjs"
import { auth } from "@/lib/auth"

export const getUsers = async () => {
  return db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      countries: {
        include: { country: { select: { name: true, flag: true } } },
      },
      _count: { select: { articles: true } },
    },
  })
}

export const getUserById = async (id: string) => {
  return db.user.findUnique({
    where: { id },
    include: {
      countries: {
        include: { country: { select: { id: true, name: true, flag: true } } },
      },
    },
  })
}

export const createUser = superAdminActionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput }) => {
    const { password, countryIds, ...rest } = parsedInput

    const existing = await db.user.findUnique({ where: { email: rest.email } })
    if (existing) throw new Error("Пользователь с таким email уже существует")

    const passwordHash = await hash(password, 12)

    const user = await db.user.create({
      data: {
        ...rest,
        passwordHash,
        countries: {
          create: countryIds.map((countryId) => ({ countryId })),
        },
      },
    })

    revalidatePath("/admin/users")
    return { id: user.id }
  })

export const updateUser = superAdminActionClient
  .schema(updateUserSchema.extend({ id: z.string() }))
  .action(async ({ parsedInput: { id, password, countryIds, ...data } }) => {
    const updateData: Record<string, unknown> = { ...data }

    if (password && password.length > 0) {
      updateData.passwordHash = await hash(password, 12)
    }

    // Sync countries: delete all old, create new
    await db.userCountry.deleteMany({ where: { userId: id } })

    const user = await db.user.update({
      where: { id },
      data: {
        ...updateData,
        countries: {
          create: countryIds.map((countryId) => ({ countryId })),
        },
      },
    })

    revalidatePath("/admin/users")
    return { id: user.id }
  })

export const deleteUser = superAdminActionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id } }) => {
    const session = await auth()
    if (session?.user?.id === id) {
      throw new Error("Нельзя удалить самого себя")
    }
    await db.user.delete({ where: { id } })
    revalidatePath("/admin/users")
  })
