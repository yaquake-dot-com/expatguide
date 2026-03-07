import { z } from "zod"

export const adSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  imageUrl: z.string().optional().nullable(),
  htmlContent: z.string().optional().nullable(),
  targetUrl: z.string().min(1, "URL обязателен").url("Введите корректный URL"),
  slot: z.enum(["HERO_BANNER", "SIDEBAR"]),
  countryId: z.string().optional().nullable(),
  startsAt: z.string().min(1, "Дата начала обязательна"),
  endsAt: z.string().min(1, "Дата окончания обязательна"),
  isActive: z.boolean(),
})

export type AdFormData = z.infer<typeof adSchema>
