"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { linkSchema, type LinkFormData } from "@/lib/validators/link"
import { createLink, updateLink } from "@/actions/links"

interface LinkFormProps {
  countries: { id: string; name: string; flag: string | null }[]
  categories: { id: string; name: string }[]
  initialData?: LinkFormData & { id: string }
}

export function LinkForm({ countries, categories, initialData }: LinkFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register, handleSubmit, control, formState: { errors },
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: initialData || {
      title: "", url: "", description: "", icon: "",
      countryId: "", categoryId: "", sortOrder: 0, isActive: true,
    },
  })

  const { execute: execCreate, isPending: isCreating } = useAction(createLink, {
    onSuccess: ({ data }) => { data?.pending ? toast.info("Отправлено на модерацию") : toast.success("Ссылка создана"); router.push("/admin/links") },
    onError: (e) => { toast.error(e.error.serverError || "Ошибка создания") },
  })

  const { execute: execUpdate, isPending: isUpdating } = useAction(updateLink, {
    onSuccess: ({ data }) => { data?.pending ? toast.info("Изменения отправлены на модерацию") : toast.success("Ссылка обновлена"); router.push("/admin/links") },
    onError: (e) => { toast.error(e.error.serverError || "Ошибка обновления") },
  })

  const isPending = isCreating || isUpdating

  function onSubmit(data: LinkFormData) {
    const cleanData = { ...data, countryId: data.countryId || null, icon: data.icon || null, description: data.description || null }
    isEditing ? execUpdate({ ...cleanData, id: initialData!.id }) : execCreate(cleanData)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input id="title" {...register("title")} placeholder="USCIS — Иммиграционная служба" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input id="url" {...register("url")} placeholder="https://www.uscis.gov" />
              {errors.url && <p className="text-sm text-destructive">{errors.url.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Категория *</Label>
              <Controller name="categoryId" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Страна</Label>
              <Controller name="countryId" control={control}
                render={({ field }) => (
                  <Select value={field.value || "ALL"} onValueChange={(v) => field.onChange(v === "ALL" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Общая (все страны)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Общая (все страны)</SelectItem>
                      {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.flag} {c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Иконка (URL)</Label>
              <Input id="icon" {...register("icon")} placeholder="https://example.com/icon.svg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Порядок сортировки</Label>
              <Input id="sortOrder" type="number" {...register("sortOrder", { valueAsNumber: true })} />
              {errors.sortOrder && <p className="text-sm text-destructive">{errors.sortOrder.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea id="description" {...register("description")} placeholder="Краткое описание ссылки..." rows={3} />
          </div>

          <div className="flex items-center gap-3">
            <Controller name="isActive" control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} id="isActive" />
              )}
            />
            <Label htmlFor="isActive">Активна</Label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Сохранить" : "Создать"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/links")}>Отмена</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
