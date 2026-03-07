"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { superAdminActionClient } from "@/lib/safe-action"
import { applyPendingChange } from "@/lib/moderation"
import { z } from "zod"
import type { ChangeStatus } from "@/generated/prisma/enums"

export const getPendingChanges = async (filters?: {
  status?: string
  entityType?: string
}) => {
  return db.pendingChange.findMany({
    where: {
      ...(filters?.status ? { status: filters.status as ChangeStatus } : {}),
      ...(filters?.entityType ? { entityType: filters.entityType as "ARTICLE" | "SPECIALIST" | "USEFUL_LINK" | "ADVERTISEMENT" } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
      reviewer: { select: { name: true } },
      country: { select: { name: true, flag: true } },
    },
  })
}

export const getPendingChangeById = async (id: string) => {
  return db.pendingChange.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, email: true } },
      reviewer: { select: { name: true } },
      country: { select: { name: true, flag: true } },
    },
  })
}

export const approvePendingChange = superAdminActionClient
  .schema(z.object({ id: z.string(), comment: z.string().optional() }))
  .action(async ({ parsedInput: { id, comment }, ctx }) => {
    // Apply the actual change
    await applyPendingChange(id)

    // Mark as approved
    await db.pendingChange.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewerId: ctx.userId,
        reviewComment: comment || null,
        reviewedAt: new Date(),
      },
    })

    revalidatePath("/admin/moderation")
    revalidatePath("/admin/specialists")
    revalidatePath("/admin/articles")
    revalidatePath("/admin/links")
    revalidatePath("/admin/ads")
    return { success: true }
  })

export const rejectPendingChange = superAdminActionClient
  .schema(z.object({ id: z.string(), comment: z.string().optional() }))
  .action(async ({ parsedInput: { id, comment }, ctx }) => {
    await db.pendingChange.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewerId: ctx.userId,
        reviewComment: comment || null,
        reviewedAt: new Date(),
      },
    })

    revalidatePath("/admin/moderation")
    return { success: true }
  })

export const bulkApprovePendingChanges = superAdminActionClient
  .schema(z.object({ ids: z.array(z.string()) }))
  .action(async ({ parsedInput: { ids }, ctx }) => {
    let approved = 0
    let errors = 0

    for (const id of ids) {
      try {
        await applyPendingChange(id)
        await db.pendingChange.update({
          where: { id },
          data: {
            status: "APPROVED",
            reviewerId: ctx.userId,
            reviewedAt: new Date(),
          },
        })
        approved++
      } catch {
        errors++
      }
    }

    revalidatePath("/admin/moderation")
    revalidatePath("/admin/specialists")
    revalidatePath("/admin/articles")
    revalidatePath("/admin/links")
    revalidatePath("/admin/ads")
    return { approved, errors }
  })
