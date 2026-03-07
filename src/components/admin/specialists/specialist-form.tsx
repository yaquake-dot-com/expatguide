"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { specialistSchema, type SpecialistFormData } from "@/lib/validators/specialist"
import { createSpecialist, updateSpecialist } from "@/actions/specialists"
import { CascadingSelect } from "@/components/admin/cascading-select"

const LANGUAGE_OPTIONS = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "th", label: "ไทย" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "he", label: "עברית" },
  { value: "tr", label: "Türkçe" },
]

interface Country {
  id: string
  name: string
  flag: string | null
  cities: { id: string; name: string }[]
}

interface Category {
  id: string
  name: string
}

interface SpecialistFormProps {
  countries: Country[]
  categories: Category[]
  initialData?: SpecialistFormData & { id: string }
}

export function SpecialistForm({ countries, categories, initialData }: SpecialistFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SpecialistFormData>({
    resolver: zodResolver(specialistSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      image: "",
      socialLinks: {
        telegram: "",
        whatsapp: "",
        instagram: "",
        facebook: "",
      },
      countryId: "",
      cityId: "",
      categoryId: "",
      languages: ["ru"],
      isActive: true,
    },
  })

  const countryId = watch("countryId")
  const cityId = watch("cityId")
  const categoryId = watch("categoryId")
  const isActive = watch("isActive")
  const languages = watch("languages")

  const { execute: execCreate, isPending: isCreating } = useAction(createSpecialist, {
    onSuccess: ({ data }) => {
      if (data?.pending) {
        toast.info("Отправлено на модерацию")
      } else {
        toast.success("Специалист создан")
      }
      router.push("/admin/specialists")
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Ошибка создания")
    },
  })

  const { execute: execUpdate, isPending: isUpdating } = useAction(updateSpecialist, {
    onSuccess: ({ data }) => {
      if (data?.pending) {
        toast.info("Изменения отправлены на модерацию")
      } else {
        toast.success("Специалист обновлён")
      }
      router.push("/admin/specialists")
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Ошибка обновления")
    },
  })

  const isPending = isCreating || isUpdating

  function toggleLanguage(lang: string, checked: boolean) {
    const current = languages || []
    if (checked) {
      setValue("languages", [...current, lang])
    } else {
      setValue("languages", current.filter((l) => l !== lang))
    }
  }

  function onSubmit(data: SpecialistFormData) {
    // Clean empty strings to null
    const cleaned = {
      ...data,
      cityId: data.cityId || "",
      description: data.description || null,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      address: data.address || null,
      image: data.image || null,
      socialLinks: data.socialLinks && Object.values(data.socialLinks).some(Boolean)
        ? data.socialLinks
        : null,
    }

    if (isEditing) {
      execUpdate({ ...cleaned, id: initialData!.id })
    } else {
      execCreate(cleaned)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Location & Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Расположение и категория</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CascadingSelect
            countries={countries}
            countryId={countryId}
            cityId={cityId}
            onCountryChange={(val) => setValue("countryId", val)}
            onCityChange={(val) => setValue("cityId", val)}
            countryError={errors.countryId?.message}
            cityError={errors.cityId?.message}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Категория *</Label>
              <Select
                value={categoryId}
                onValueChange={(val) => setValue("categoryId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
              <Label htmlFor="isActive">Активен</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Языки *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {LANGUAGE_OPTIONS.map((lang) => (
              <div key={lang.value} className="flex items-center gap-2">
                <Checkbox
                  id={`lang-${lang.value}`}
                  checked={languages?.includes(lang.value) || false}
                  onCheckedChange={(checked) => toggleLanguage(lang.value, !!checked)}
                />
                <Label htmlFor={`lang-${lang.value}`} className="cursor-pointer font-normal">
                  {lang.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.languages && (
            <p className="mt-2 text-sm text-destructive">{errors.languages.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Имя / Название *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Иван Петров"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Краткое описание деятельности специалиста..."
                rows={4}
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="image">URL фото</Label>
              <Input
                id="image"
                {...register("image")}
                placeholder="https://example.com/photo.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Прямая ссылка на фотографию (загрузка файлов будет добавлена позже)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Контактные данные</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="specialist@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Сайт</Label>
              <Input
                id="website"
                {...register("website")}
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="text-sm text-destructive">{errors.website.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Адрес</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="123 Main St, City"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Социальные сети</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram</Label>
              <Input
                id="telegram"
                {...register("socialLinks.telegram")}
                placeholder="@username или https://t.me/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                {...register("socialLinks.whatsapp")}
                placeholder="+1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                {...register("socialLinks.instagram")}
                placeholder="@username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                {...register("socialLinks.facebook")}
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Сохранить" : "Создать"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/specialists")}
        >
          Отмена
        </Button>
      </div>
    </form>
  )
}
