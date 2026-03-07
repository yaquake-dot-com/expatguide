import { z } from "zod"

export const citySchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  slug: z.string().min(1, "Slug обязателен").regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  countryId: z.string().min(1, "Выберите страну"),
})

export type CityFormData = z.infer<typeof citySchema>
