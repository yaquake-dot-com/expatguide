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
import { adSchema, type AdFormData } from "@/lib/validators/ad"
import { createAd, updateAd } from "@/actions/ads"
import { FileUpload } from "@/components/admin/file-upload"

interface AdFormProps {
  countries: { id: string; name: string; flag: string | null }[]
  initialData?: AdFormData & { id: string }
}

export function AdForm({ countries, initialData }: AdFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register, handleSubmit, control, setValue, watch, formState: { errors },
  } = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: initialData || {
      title: "", imageUrl: "", htmlContent: "", targetUrl: "",
      slot: "HERO_BANNER", countryId: "", startsAt: "", endsAt: "", isActive: true,
    },
  })

  const imageUrl = watch("imageUrl")

  const { execute: execCreate, isPending: isCreating } = useAction(createAd, {
    onSuccess: ({ data }) => { data?.pending ? toast.info("Отправлено на модерацию") : toast.success("Баннер создан"); router.push("/admin/ads") },
    onError: (e) => { toast.error(e.error.serverError || "Ошибка создания") },
  })

  const { execute: execUpdate, isPending: isUpdating } = useAction(updateAd, {
    onSuccess: ({ data }) => { data?.pending ? toast.info("Изменения отправлены на модерацию") : toast.success("Баннер обновлен"); router.push("/admin/ads") },
    onError: (e) => { toast.error(e.error.serverError || "Ошибка обновления") },
  })

  const isPending = isCreating || isUpdating

  function onSubmit(data: AdFormData) {
    const cleanData = { ...data, countryId: data.countryId || null, imageUrl: data.imageUrl || null, htmlContent: data.htmlContent || null }
    isEditing ? execUpdate({ ...cleanData, id: initialData!.id }) : execCreate(cleanData)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input id="title" {...register("title")} placeholder="Весенний баннер" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetUrl">URL перехода *</Label>
              <Input id="targetUrl" {...register("targetUrl")} placeholder="https://example.com/promo" />
              {errors.targetUrl && <p className="text-sm text-destructive">{errors.targetUrl.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Слот *</Label>
              <Controller name="slot" control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HERO_BANNER">Главный баннер</SelectItem>
                      <SelectItem value="SIDEBAR">Боковая панель</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Страна</Label>
              <Controller name="countryId" control={control}
                render={({ field }) => (
                  <Select value={field.value || "ALL"} onValueChange={(v) => field.onChange(v === "ALL" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="Все страны" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Все страны</SelectItem>
                      {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.flag} {c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startsAt">Дата начала *</Label>
              <Input id="startsAt" type="date" {...register("startsAt")} />
              {errors.startsAt && <p className="text-sm text-destructive">{errors.startsAt.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endsAt">Дата окончания *</Label>
              <Input id="endsAt" type="date" {...register("endsAt")} />
              {errors.endsAt && <p className="text-sm text-destructive">{errors.endsAt.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Изображение</Label>
            <FileUpload value={imageUrl || null} onChange={(url) => setValue("imageUrl", url || "")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="htmlContent">HTML-контент (альтернатива изображению)</Label>
            <Textarea id="htmlContent" {...register("htmlContent")} placeholder="<div>...</div>" rows={4} />
          </div>

          <div className="flex items-center gap-3">
            <Controller name="isActive" control={control}
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} id="isActive" />}
            />
            <Label htmlFor="isActive">Активен</Label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Сохранить" : "Создать"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/ads")}>Отмена</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
