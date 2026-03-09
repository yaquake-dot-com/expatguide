import { z } from "zod"

export const countrySchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  nameIn: z.string(), // предложный: "в Германии"
  nameFor: z.string(), // родительный: "для Германии"
  slug: z.string().min(1, "Slug обязателен").regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  code: z.string().min(2, "Код обязателен").max(2, "Код — 2 символа").regex(/^[A-Z]+$/, "Только заглавные латинские буквы"),
  flag: z.string().optional().nullable(),
  heroImage: z.string().optional().nullable(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
})

// Use z.input for form type (before transform/coerce)
export type CountryFormData = z.infer<typeof countrySchema>

// Schema for actions (server-side, allows coercion from string)
export const countryActionSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  nameIn: z.string(),
  nameFor: z.string(),
  slug: z.string().min(1, "Slug обязателен").regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  code: z.string().min(2, "Код обязателен").max(2, "Код — 2 символа").regex(/^[A-Z]+$/, "Только заглавные латинские буквы"),
  flag: z.string().optional().nullable(),
  heroImage: z.string().optional().nullable(),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int(),
})
