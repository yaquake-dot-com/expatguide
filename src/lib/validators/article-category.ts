import { z } from "zod"

export const articleCategorySchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  slug: z.string().min(1, "Slug обязателен").regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
})

export type ArticleCategoryFormData = z.infer<typeof articleCategorySchema>
