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
import { linkCategorySchema, type LinkCategoryFormData } from "@/lib/validators/link-category"
import { createLinkCategory, updateLinkCategory } from "@/actions/link-categories"
import { generateSlug } from "@/lib/utils"

interface LinkCategoryFormProps {
  initialData?: LinkCategoryFormData & { id: string }
}

export function LinkCategoryForm({ initialData }: LinkCategoryFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LinkCategoryFormData>({
    resolver: zodResolver(linkCategorySchema),
    defaultValues: initialData || { name: "", slug: "" },
  })

  const { execute: execCreate, isPending: isCreating } = useAction(createLinkCategory, {
    onSuccess: () => { toast.success("Категория создана"); router.push("/admin/link-categories") },
    onError: (e) => { toast.error(e.error.serverError || "Ошибка создания") },
  })

  const { execute: execUpdate, isPending: isUpdating } = useAction(updateLinkCategory, {
    onSuccess: () => { toast.success("Категория обновлена"); router.push("/admin/link-categories") },
    onError: (e) => { toast.error(e.error.serverError || "Ошибка обновления") },
  })

  const isPending = isCreating || isUpdating

  function onSubmit(data: LinkCategoryFormData) {
    isEditing ? execUpdate({ ...data, id: initialData!.id }) : execCreate(data)
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setValue("name", name)
    if (!isEditing) setValue("slug", generateSlug(name))
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input id="name" {...register("name")} onChange={handleNameChange} placeholder="Госуслуги" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input id="slug" {...register("slug")} placeholder="government" />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Сохранить" : "Создать"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/link-categories")}>Отмена</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
