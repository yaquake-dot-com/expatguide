import { z } from "zod"

export const updateThemeSchema = z.object({
  theme: z.enum(["default", "neobrutalism"]),
})

export type UpdateThemeFormData = z.infer<typeof updateThemeSchema>
