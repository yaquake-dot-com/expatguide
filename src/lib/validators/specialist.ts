import { z } from "zod"

export const specialistSchema = z.object({
  name: z.string().min(1, "Имя обязательно"),
  description: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Некорректный email").optional().nullable().or(z.literal("")),
  website: z.string().url("Некорректный URL").optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  socialLinks: z.object({
    telegram: z.string().optional(),
    whatsapp: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
  }).optional().nullable(),
  countryId: z.string().min(1, "Выберите страну"),
  cityId: z.string(),
  categoryId: z.string().min(1, "Выберите категорию"),
  languages: z.array(z.string()).min(1, "Выберите хотя бы один язык"),
  isActive: z.boolean(),
})

export type SpecialistFormData = z.infer<typeof specialistSchema>
