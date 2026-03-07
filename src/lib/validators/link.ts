import { z } from "zod"

export const linkSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  url: z.string().min(1, "URL обязателен").url("Введите корректный URL"),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  countryId: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Выберите категорию"),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
})

export type LinkFormData = z.infer<typeof linkSchema>

export const linkActionSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  url: z.string().min(1, "URL обязателен").url("Введите корректный URL"),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  countryId: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Выберите категорию"),
  sortOrder: z.coerce.number().int(),
  isActive: z.boolean(),
})
