"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { citySchema, type CityFormData } from "@/lib/validators/city"
import { createCity, updateCity } from "@/actions/cities"
import { generateSlug } from "@/lib/utils"

interface Country {
  id: string
  name: string
  flag: string | null
}

interface CityFormProps {
  countries: Country[]
  initialData?: CityFormData & { id: string }
}

export function CityForm({ countries, initialData }: CityFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CityFormData>({
    resolver: zodResolver(citySchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      countryId: "",
    },
  })

  const countryId = watch("countryId")

  const { execute: execCreate, isPending: isCreating } = useAction(createCity, {
    onSuccess: () => {
      toast.success("Город создан")
      router.push("/admin/cities")
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Ошибка создания")
    },
  })

  const { execute: execUpdate, isPending: isUpdating } = useAction(updateCity, {
    onSuccess: () => {
      toast.success("Город обновлён")
      router.push("/admin/cities")
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Ошибка обновления")
    },
  })

  const isPending = isCreating || isUpdating

  function onSubmit(data: CityFormData) {
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
            {/* Country */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Страна *</Label>
              <Select
                value={countryId}
                onValueChange={(val) => setValue("countryId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите страну" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.countryId && (
                <p className="text-sm text-destructive">{errors.countryId.message}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                {...register("name")}
                onChange={handleNameChange}
                placeholder="Нью-Йорк"
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
                placeholder="new-york"
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
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
              onClick={() => router.push("/admin/cities")}
            >
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
