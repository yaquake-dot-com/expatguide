import { z } from "zod"

export const specialistCategorySchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  slug: z.string().min(1, "Slug обязателен").regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  icon: z.string().optional().nullable(),
  sortOrder: z.number().int(),
})

export type SpecialistCategoryFormData = z.infer<typeof specialistCategorySchema>

export const specialistCategoryActionSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  slug: z.string().min(1, "Slug обязателен").regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  icon: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int(),
})
