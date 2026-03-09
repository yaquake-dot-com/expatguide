"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { countrySchema, type CountryFormData } from "@/lib/validators/country"
import { createCountry, updateCountry } from "@/actions/countries"
import { generateSlug } from "@/lib/utils"
import { FileUpload } from "@/components/admin/file-upload"

interface CountryFormProps {
  initialData?: CountryFormData & { id: string }
}

export function CountryForm({ initialData }: CountryFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CountryFormData>({
    resolver: zodResolver(countrySchema),
    defaultValues: initialData || {
      name: "",
      nameIn: "",
      nameFor: "",
      slug: "",
      code: "",
      flag: "",
      heroImage: null,
      isActive: true,
      sortOrder: 0,
    },
  })

  const isActive = watch("isActive")

  const { execute: execCreate, isPending: isCreating } = useAction(createCountry, {
    onSuccess: () => {
      toast.success("Страна создана")
      router.push("/admin/countries")
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Ошибка создания")
    },
  })

  const { execute: execUpdate, isPending: isUpdating } = useAction(updateCountry, {
    onSuccess: () => {
      toast.success("Страна обновлена")
      router.push("/admin/countries")
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Ошибка обновления")
    },
  })

  const isPending = isCreating || isUpdating

  function onSubmit(data: CountryFormData) {
    if (isEditing) {
      execUpdate({ ...data, id: initialData!.id })
    } else {
      execCreate(data)
    }
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setValue("name", name)
    if (!isEditing || !initialData?.slug) {
      setValue("slug", generateSlug(name))
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                {...register("name")}
                onChange={handleNameChange}
                placeholder="США"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Name In (предложный) */}
            <div className="space-y-2">
              <Label htmlFor="nameIn">Предложный падеж</Label>
              <Input
                id="nameIn"
                {...register("nameIn")}
                placeholder="в Германии / в США"
              />
              <p className="text-xs text-muted-foreground">Используется: «Справочник специалистов в Германии»</p>
            </div>

            {/* Name For (родительный) */}
            <div className="space-y-2">
              <Label htmlFor="nameFor">Родительный падеж</Label>
              <Input
                id="nameFor"
                {...register("nameFor")}
                placeholder="для Германии / для США"
              />
              <p className="text-xs text-muted-foreground">Используется: «Статьи для Германии»</p>
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="usa"
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>

            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">ISO код (2 буквы) *</Label>
              <Input
                id="code"
                {...register("code")}
                placeholder="US"
                maxLength={2}
                className="uppercase"
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>

            {/* Flag */}
            <div className="space-y-2">
              <Label htmlFor="flag">Эмодзи флага</Label>
              <Input
                id="flag"
                {...register("flag")}
                placeholder="🇺🇸"
              />
            </div>

            {/* Hero Image */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Фоновое изображение героя</Label>
              <p className="text-xs text-muted-foreground">Широкое фото страны для шапки. Рекомендуемый размер: 1920x600+</p>
              <FileUpload
                value={watch("heroImage")}
                onChange={(url) => setValue("heroImage", url)}
                label="Загрузить фон"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Порядок сортировки</Label>
              <Input
                id="sortOrder"
                type="number"
                {...register("sortOrder", { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.sortOrder && (
                <p className="text-sm text-destructive">{errors.sortOrder.message}</p>
              )}
            </div>

            {/* Active */}
            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
              <Label htmlFor="isActive">Активна</Label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Сохранить" : "Создать"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/countries")}
            >
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
