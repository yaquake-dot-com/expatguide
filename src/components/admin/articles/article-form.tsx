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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { articleSchema, type ArticleFormData } from "@/lib/validators/article"
import { createArticle, updateArticle } from "@/actions/articles"
import { generateSlug } from "@/lib/utils"
import { TipTapEditor } from "@/components/editor/tiptap-editor"
import { FileUpload } from "@/components/admin/file-upload"
import { type JSONContent } from "@tiptap/react"

interface Country {
  id: string
  name: string
  flag: string | null
}

interface Category {
  id: string
  name: string
}

interface ArticleFormProps {
  countries: Country[]
  categories: Category[]
  initialData?: ArticleFormData & { id: string }
}

export function ArticleForm({ countries, categories, initialData }: ArticleFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: initialData || {
      title: "",
      slug: "",
      excerpt: "",
      content: { type: "doc", content: [{ type: "paragraph" }] },
      coverImage: "",
      type: "COUNTRY",
      countryId: "",
      categoryId: "",
      status: "DRAFT",
      attachmentsPosition: "TOP",
    },
  })

  const articleType = watch("type")
  const status = watch("status")
  const coverImage = watch("coverImage")

  const { execute: execCreate, isPending: isCreating } = useAction(createArticle, {
    onSuccess: ({ data }) => {
      if (data?.pending) {
        toast.info("Отправлено на модерацию")
      } else {
        toast.success("Статья создана")
      }
      router.push("/admin/articles")
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Ошибка создания")
    },
  })

  const { execute: execUpdate, isPending: isUpdating } = useAction(updateArticle, {
    onSuccess: ({ data }) => {
      if (data?.pending) {
        toast.info("Изменения отправлены на модерацию")
      } else {
        toast.success("Статья обновлена")
      }
      router.push("/admin/articles")
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Ошибка обновления")
    },
  })

  const isPending = isCreating || isUpdating

  function onSubmit(data: ArticleFormData) {
    // Deep-clone content to strip TipTap prototypes before sending to server action
    const cleanData = {
      ...data,
      content: JSON.parse(JSON.stringify(data.content)),
      coverImage: data.coverImage || null,
      countryId: data.countryId || null,
    }
    if (isEditing) {
      execUpdate({ ...cleanData, id: initialData!.id })
    } else {
      execCreate(cleanData)
    }
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value
    setValue("title", title)
    if (!isEditing) {
      setValue("slug", generateSlug(title))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Meta */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Основное</CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={status === "PUBLISHED" ? "default" : "outline"}
                className={status === "PUBLISHED" ? "bg-green-100 text-green-800" : ""}
              >
                {status === "PUBLISHED" ? "Опубликована" : "Черновик"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Title */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Заголовок *</Label>
              <Input
                id="title"
                {...register("title")}
                onChange={handleTitleChange}
                placeholder="Как получить визу в США"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="kak-poluchit-vizu-v-ssha"
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Категория *</Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
                )}
              />
              {errors.categoryId && (
                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Тип статьи *</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COUNTRY">Страновая (для конкретной страны)</SelectItem>
                      <SelectItem value="GENERAL">Общая (для всех стран)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Country (only for COUNTRY type) */}
            {articleType === "COUNTRY" && (
              <div className="space-y-2">
                <Label>Страна *</Label>
                <Controller
                  name="countryId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange}>
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
                  )}
                />
                {errors.countryId && (
                  <p className="text-sm text-destructive">{errors.countryId.message}</p>
                )}
              </div>
            )}

            {/* Status */}
            <div className="space-y-2">
              <Label>Статус</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Черновик</SelectItem>
                      <SelectItem value="PUBLISHED">Опубликовать</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Attachments Position */}
            <div className="space-y-2">
              <Label>Позиция вложений</Label>
              <Controller
                name="attachmentsPosition"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TOP">Сверху</SelectItem>
                      <SelectItem value="BOTTOM">Снизу</SelectItem>
                      <SelectItem value="BOTH">Сверху и снизу</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Краткое описание *</Label>
            <Textarea
              id="excerpt"
              {...register("excerpt")}
              placeholder="Краткое описание статьи для превью..."
              rows={3}
            />
            {errors.excerpt && (
              <p className="text-sm text-destructive">{errors.excerpt.message}</p>
            )}
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Обложка</Label>
            <FileUpload
              value={coverImage}
              onChange={(url) => setValue("coverImage", url)}
              accept="image/*"
              label="Загрузить обложку"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Содержание статьи</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TipTapEditor
                content={field.value as JSONContent}
                onChange={(json) => field.onChange(json)}
              />
            )}
          />
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
          onClick={() => router.push("/admin/articles")}
        >
          Отмена
        </Button>
      </div>
    </form>
  )
}
