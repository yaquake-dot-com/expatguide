import { z } from "zod"

export const createUserSchema = z.object({
  name: z.string().min(1, "Имя обязательно"),
  nickname: z.string().min(1, "Никнейм обязателен"),
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
  role: z.enum(["SUPER_ADMIN", "COUNTRY_ADMIN"]),
  countryIds: z.array(z.string()),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  name: z.string().min(1, "Имя обязательно"),
  nickname: z.string().min(1, "Никнейм обязателен"),
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов").optional().or(z.literal("")),
  role: z.enum(["SUPER_ADMIN", "COUNTRY_ADMIN"]),
  countryIds: z.array(z.string()),
})

export type UpdateUserFormData = z.infer<typeof updateUserSchema>
