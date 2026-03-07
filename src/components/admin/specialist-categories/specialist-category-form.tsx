"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { specialistCategorySchema, type SpecialistCategoryFormData } from "@/lib/validators/specialist-category"
import { createSpecialistCategory, updateSpecialistCategory } from "@/actions/specialist-categories"
import { generateSlug } from "@/lib/utils"

interface SpecialistCategoryFormProps {
  initialData?: SpecialistCategoryFormData & { id: string }
}

export function SpecialistCategoryForm({ initialData }: SpecialistCategoryFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SpecialistCategoryFormData>({
    resolver: zodResolver(specialistCategorySchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      icon: "",
      sortOrder: 0,
    },
  })

  const { execute: execCreate, isPending: isCreating } = useAction(createSpecialistCategory, {
    onSuccess: () => {
      toast.success("Категория создана")
      router.push("/admin/specialist-categories")
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Ошибка создания")
    },
  })

  const { execute: execUpdate, isPending: isUpdating } = useAction(updateSpecialistCategory, {
    onSuccess: () => {
      toast.success("Категория обновлена")
      router.push("/admin/specialist-categories")
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Ошибка обновления")
    },
  })

  const isPending = isCreating || isUpdating

  function onSubmit(data: SpecialistCategoryFormData) {
    if (isEditing) {
      execUpdate({ ...data, id: initialData!.id })
    } else {
      execCreate(data)
    }
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setValue("name", name)
    if (!isEditing) {
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
                placeholder="Юристы"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="lawyers"
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label htmlFor="icon">Иконка (Lucide)</Label>
              <Input
                id="icon"
                {...register("icon")}
                placeholder="Scale, Stethoscope, Briefcase..."
              />
              <p className="text-xs text-muted-foreground">
                Название иконки из библиотеки Lucide
              </p>
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
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Сохранить" : "Создать"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/specialist-categories")}
            >
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
