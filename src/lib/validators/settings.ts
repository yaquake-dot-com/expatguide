import { z } from "zod"

export const updateThemeSchema = z.object({
  theme: z.enum(["default", "neobrutalism"]),
})

export type UpdateThemeFormData = z.infer<typeof updateThemeSchema>

export const updateSiteNameSchema = z.object({
  siteName: z.string().min(1, "Название сайта не может быть пустым").max(100, "Максимум 100 символов"),
})

export type UpdateSiteNameFormData = z.infer<typeof updateSiteNameSchema>
