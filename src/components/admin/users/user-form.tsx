"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import {
  createUserSchema, updateUserSchema,
  type CreateUserFormData, type UpdateUserFormData,
} from "@/lib/validators/user"
import { createUser, updateUser } from "@/actions/users"

interface UserFormProps {
  countries: { id: string; name: string; flag: string | null }[]
  initialData?: UpdateUserFormData & { id: string }
}

export function UserForm({ countries, initialData }: UserFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register, handleSubmit, control, watch, formState: { errors },
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: initialData || {
      name: "", nickname: "", email: "", password: "",
      role: "COUNTRY_ADMIN", countryIds: [],
    },
  })

  const role = watch("role")

  const { execute: execCreate, isPending: isCreating } = useAction(createUser, {
    onSuccess: () => { toast.success("Пользователь создан"); router.push("/admin/users") },
    onError: (e) => { toast.error(e.error.serverError || "Ошибка создания") },
  })

  const { execute: execUpdate, isPending: isUpdating } = useAction(updateUser, {
    onSuccess: () => { toast.success("Пользователь обновлен"); router.push("/admin/users") },
    onError: (e) => { toast.error(e.error.serverError || "Ошибка обновления") },
  })

  const isPending = isCreating || isUpdating

  function onSubmit(data: CreateUserFormData | UpdateUserFormData) {
    const cleanData = {
      ...data,
      countryIds: data.role === "SUPER_ADMIN" ? [] : data.countryIds,
    }
    if (isEditing) {
      execUpdate({ ...cleanData, id: initialData!.id })
    } else {
      execCreate(cleanData as CreateUserFormData)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Имя *</Label>
              <Input id="name" {...register("name")} placeholder="Иван Иванов" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">Никнейм *</Label>
              <Input id="nickname" {...register("nickname")} placeholder="ivan_admin" />
              <p className="text-xs text-muted-foreground">Отображается на сайте вместо настоящего имени</p>
              {errors.nickname && <p className="text-sm text-destructive">{errors.nickname.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register("email")} placeholder="user@example.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль {isEditing ? "" : "*"}</Label>
              <Input id="password" type="password" {...register("password")} placeholder={isEditing ? "Оставьте пустым, чтобы не менять" : "Минимум 6 символов"} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Роль *</Label>
              <Controller name="role" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUPER_ADMIN">Суперадмин</SelectItem>
                      <SelectItem value="COUNTRY_ADMIN">Админ страны</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {role === "COUNTRY_ADMIN" && (
            <div className="space-y-3">
              <Label>Страны доступа</Label>
              <Controller name="countryIds" control={control}
                render={({ field }) => (
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {countries.map((country) => (
                      <label key={country.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={field.value.includes(country.id)}
                          onCheckedChange={(checked: boolean) => {
                            if (checked) field.onChange([...field.value, country.id])
                            else field.onChange(field.value.filter((id: string) => id !== country.id))
                          }}
                        />
                        <span className="text-sm">{country.flag} {country.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
              <p className="text-xs text-muted-foreground">Выберите страны, к которым будет доступ у этого администратора</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Сохранить" : "Создать"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>Отмена</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
