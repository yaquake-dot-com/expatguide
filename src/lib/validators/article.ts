import { z } from "zod"

export const articleSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  slug: z.string().min(1, "Slug обязателен").regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  excerpt: z.string().min(1, "Краткое описание обязательно"),
  content: z.any(), // TipTap JSON
  coverImage: z.string().optional().nullable(),
  type: z.enum(["COUNTRY", "GENERAL"]),
  countryId: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Выберите категорию"),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  attachmentsPosition: z.enum(["TOP", "BOTTOM", "BOTH"]),
})

export type ArticleFormData = z.infer<typeof articleSchema>

export const attachmentSchema = z.object({
  label: z.string().min(1, "Название обязательно"),
  type: z.enum(["FILE", "EXTERNAL_LINK"]),
  url: z.string().min(1, "URL обязателен"),
  platform: z.enum(["ANDROID", "IOS", "WINDOWS", "MACOS", "LINUX", "PDF", "ZIP", "OTHER"]).optional().nullable(),
  fileSize: z.number().int().optional().nullable(),
  version: z.string().optional().nullable(),
  sortOrder: z.number().int(),
})

export type AttachmentFormData = z.infer<typeof attachmentSchema>
