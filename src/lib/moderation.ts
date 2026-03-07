import { db } from "@/lib/db"
import type { EntityType, ChangeAction } from "@/generated/prisma/enums"

/**
 * Build a diff object comparing old and new data.
 * Returns { field: { old: any, new: any } } for changed fields only.
 */
export function buildDiff(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): Record<string, { old: unknown; new: unknown }> {
  const diff: Record<string, { old: unknown; new: unknown }> = {}

  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)])
  for (const key of allKeys) {
    // Skip internal fields
    if (["id", "createdAt", "updatedAt"].includes(key)) continue

    const oldVal = oldData[key] ?? null
    const newVal = newData[key] ?? null

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[key] = { old: oldVal, new: newVal }
    }
  }

  return diff
}

/**
 * Entity type labels for display
 */
export const entityTypeLabels: Record<string, string> = {
  ARTICLE: "Статья",
  SPECIALIST: "Специалист",
  USEFUL_LINK: "Полезная ссылка",
  ADVERTISEMENT: "Баннер",
}

/**
 * Action labels for display
 */
export const actionLabels: Record<string, string> = {
  CREATE: "Создание",
  UPDATE: "Редактирование",
  DELETE: "Удаление",
}

/**
 * Create a pending change record for moderation.
 * Returns the created PendingChange.
 */
export async function createPendingChange(params: {
  entityType: EntityType
  entityId?: string | null
  action: ChangeAction
  data?: Record<string, unknown> | null
  diff?: Record<string, { old: unknown; new: unknown }> | null
  authorId: string
  countryId?: string | null
}) {
  const pending = await db.pendingChange.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId || null,
      action: params.action,
      data: params.data ? JSON.parse(JSON.stringify(params.data)) : null,
      diff: params.diff ? JSON.parse(JSON.stringify(params.diff)) : null,
      authorId: params.authorId,
      countryId: params.countryId || null,
    },
  })

  return pending
}

/**
 * Apply an approved pending change — execute the actual DB mutation.
 */
export async function applyPendingChange(changeId: string) {
  const change = await db.pendingChange.findUnique({
    where: { id: changeId },
  })

  if (!change) throw new Error("Изменение не найдено")
  if (change.status !== "PENDING") throw new Error("Изменение уже обработано")

  const data = change.data as Record<string, unknown> | null

  switch (change.entityType) {
    case "SPECIALIST":
      await applySpecialistChange(change.action, change.entityId, data)
      break
    case "ARTICLE":
      await applyArticleChange(change.action, change.entityId, data)
      break
    case "USEFUL_LINK":
      await applyUsefulLinkChange(change.action, change.entityId, data)
      break
    case "ADVERTISEMENT":
      await applyAdvertisementChange(change.action, change.entityId, data)
      break
  }
}

async function applySpecialistChange(
  action: ChangeAction,
  entityId: string | null,
  data: Record<string, unknown> | null
) {
  if (action === "CREATE" && data) {
    const { socialLinks, ...rest } = data as Record<string, unknown>
    await db.specialist.create({
      data: {
        name: rest.name as string,
        description: (rest.description as string) || null,
        phone: (rest.phone as string) || null,
        email: (rest.email as string) || null,
        website: (rest.website as string) || null,
        address: (rest.address as string) || null,
        image: (rest.image as string) || null,
        socialLinks: socialLinks ?? undefined,
        countryId: rest.countryId as string,
        cityId: (rest.cityId as string) || null,
        categoryId: rest.categoryId as string,
        languages: (rest.languages as string[]) || ["ru"],
        isActive: (rest.isActive as boolean) ?? true,
      },
    })
  } else if (action === "UPDATE" && entityId && data) {
    const { socialLinks, ...rest } = data as Record<string, unknown>
    await db.specialist.update({
      where: { id: entityId },
      data: {
        name: rest.name as string,
        description: (rest.description as string) || null,
        phone: (rest.phone as string) || null,
        email: (rest.email as string) || null,
        website: (rest.website as string) || null,
        address: (rest.address as string) || null,
        image: (rest.image as string) || null,
        socialLinks: socialLinks ?? undefined,
        countryId: rest.countryId as string,
        cityId: (rest.cityId as string) || null,
        categoryId: rest.categoryId as string,
        languages: (rest.languages as string[]) || ["ru"],
        isActive: (rest.isActive as boolean) ?? true,
      },
    })
  } else if (action === "DELETE" && entityId) {
    await db.specialist.delete({ where: { id: entityId } })
  }
}

async function applyArticleChange(
  action: ChangeAction,
  entityId: string | null,
  data: Record<string, unknown> | null
) {
  if (action === "CREATE" && data) {
    const content = data.content ? JSON.parse(JSON.stringify(data.content)) : {}
    await db.article.create({
      data: {
        title: data.title as string,
        slug: data.slug as string,
        excerpt: data.excerpt as string,
        content: content,
        coverImage: (data.coverImage as string) || null,
        type: data.type as "COUNTRY" | "GENERAL",
        countryId: (data.countryId as string) || null,
        categoryId: data.categoryId as string,
        authorId: data.authorId as string,
        status: (data.status as "DRAFT" | "PUBLISHED") || "DRAFT",
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        attachmentsPosition: (data.attachmentsPosition as "TOP" | "BOTTOM" | "BOTH") || "TOP",
      },
    })
  } else if (action === "UPDATE" && entityId && data) {
    const content = data.content ? JSON.parse(JSON.stringify(data.content)) : undefined
    const existing = await db.article.findUnique({ where: { id: entityId } })
    await db.article.update({
      where: { id: entityId },
      data: {
        title: data.title as string,
        slug: data.slug as string,
        excerpt: data.excerpt as string,
        ...(content !== undefined ? { content } : {}),
        coverImage: (data.coverImage as string) || null,
        type: data.type as "COUNTRY" | "GENERAL",
        countryId: data.type === "COUNTRY" ? ((data.countryId as string) || null) : null,
        categoryId: data.categoryId as string,
        status: (data.status as "DRAFT" | "PUBLISHED") || "DRAFT",
        publishedAt:
          data.status === "PUBLISHED" && existing?.status !== "PUBLISHED"
            ? new Date()
            : existing?.publishedAt,
        attachmentsPosition: (data.attachmentsPosition as "TOP" | "BOTTOM" | "BOTH") || "TOP",
      },
    })
  } else if (action === "DELETE" && entityId) {
    await db.article.delete({ where: { id: entityId } })
  }
}

async function applyUsefulLinkChange(
  action: ChangeAction,
  entityId: string | null,
  data: Record<string, unknown> | null
) {
  if (action === "CREATE" && data) {
    await db.usefulLink.create({
      data: {
        title: data.title as string,
        url: data.url as string,
        description: (data.description as string) || null,
        icon: (data.icon as string) || null,
        countryId: (data.countryId as string) || null,
        categoryId: data.categoryId as string,
        sortOrder: (data.sortOrder as number) || 0,
        isActive: (data.isActive as boolean) ?? true,
      },
    })
  } else if (action === "UPDATE" && entityId && data) {
    await db.usefulLink.update({
      where: { id: entityId },
      data: {
        title: data.title as string,
        url: data.url as string,
        description: (data.description as string) || null,
        icon: (data.icon as string) || null,
        countryId: (data.countryId as string) || null,
        categoryId: data.categoryId as string,
        sortOrder: (data.sortOrder as number) || 0,
        isActive: (data.isActive as boolean) ?? true,
      },
    })
  } else if (action === "DELETE" && entityId) {
    await db.usefulLink.delete({ where: { id: entityId } })
  }
}

async function applyAdvertisementChange(
  action: ChangeAction,
  entityId: string | null,
  data: Record<string, unknown> | null
) {
  if (action === "CREATE" && data) {
    await db.advertisement.create({
      data: {
        title: data.title as string,
        targetUrl: data.targetUrl as string,
        imageUrl: (data.imageUrl as string) || null,
        htmlContent: (data.htmlContent as string) || null,
        slot: data.slot as "HERO_BANNER" | "SIDEBAR",
        countryId: (data.countryId as string) || null,
        startsAt: new Date(data.startsAt as string),
        endsAt: new Date(data.endsAt as string),
        isActive: (data.isActive as boolean) ?? true,
      },
    })
  } else if (action === "UPDATE" && entityId && data) {
    await db.advertisement.update({
      where: { id: entityId },
      data: {
        title: data.title as string,
        targetUrl: data.targetUrl as string,
        imageUrl: (data.imageUrl as string) || null,
        htmlContent: (data.htmlContent as string) || null,
        slot: data.slot as "HERO_BANNER" | "SIDEBAR",
        countryId: (data.countryId as string) || null,
        startsAt: new Date(data.startsAt as string),
        endsAt: new Date(data.endsAt as string),
        isActive: (data.isActive as boolean) ?? true,
      },
    })
  } else if (action === "DELETE" && entityId) {
    await db.advertisement.delete({ where: { id: entityId } })
  }
}
