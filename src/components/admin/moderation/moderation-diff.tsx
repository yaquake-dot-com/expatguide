"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const fieldLabels: Record<string, string> = {
  title: "Название",
  name: "Имя",
  slug: "Slug",
  excerpt: "Описание",
  content: "Содержание",
  coverImage: "Обложка",
  type: "Тип",
  countryId: "Страна",
  cityId: "Город",
  categoryId: "Категория",
  status: "Статус",
  isActive: "Активна",
  url: "URL",
  targetUrl: "URL перехода",
  description: "Описание",
  phone: "Телефон",
  email: "Email",
  website: "Сайт",
  address: "Адрес",
  image: "Изображение",
  imageUrl: "Изображение",
  htmlContent: "HTML-контент",
  slot: "Слот",
  sortOrder: "Порядок",
  startsAt: "Начало",
  endsAt: "Окончание",
  icon: "Иконка",
  socialLinks: "Соц. сети",
  authorId: "Автор",
  attachmentsPosition: "Позиция вложений",
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—"
  if (typeof value === "boolean") return value ? "Да" : "Нет"
  if (typeof value === "object") return JSON.stringify(value, null, 2)
  return String(value)
}

interface ModerationDiffProps {
  action: string
  data: Record<string, unknown> | null
  diff: Record<string, { old: unknown; new: unknown }> | null
}

export function ModerationDiff({ action, data, diff }: ModerationDiffProps) {
  if (action === "DELETE") {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-sm text-destructive">Запрос на удаление</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            При одобрении объект будет безвозвратно удален.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (action === "CREATE" && data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Новый объект</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(data).map(([key, value]) => {
              // Skip internal fields
              if (["id", "createdAt", "updatedAt", "authorId"].includes(key)) return null
              // Skip content (too large)
              if (key === "content") return (
                <div key={key} className="flex gap-4 text-sm">
                  <span className="w-40 shrink-0 font-medium text-muted-foreground">
                    {fieldLabels[key] || key}
                  </span>
                  <Badge variant="outline">Содержание статьи (JSON)</Badge>
                </div>
              )
              return (
                <div key={key} className="flex gap-4 text-sm">
                  <span className="w-40 shrink-0 font-medium text-muted-foreground">
                    {fieldLabels[key] || key}
                  </span>
                  <span className="text-foreground break-all">
                    {formatValue(value)}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (action === "UPDATE" && diff) {
    const entries = Object.entries(diff)
    if (entries.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Нет различий для отображения.</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Изменения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entries.map(([key, { old: oldVal, new: newVal }]) => {
              if (key === "content") return (
                <div key={key} className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium">{fieldLabels[key] || key}</p>
                  <Badge variant="outline">Содержание статьи изменено</Badge>
                </div>
              )
              return (
                <div key={key} className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium">
                    {fieldLabels[key] || key}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded bg-red-50 p-2 dark:bg-red-950/20">
                      <p className="mb-1 text-xs font-medium text-red-600 dark:text-red-400">Было</p>
                      <p className="text-sm break-all">{formatValue(oldVal)}</p>
                    </div>
                    <div className="rounded bg-green-50 p-2 dark:bg-green-950/20">
                      <p className="mb-1 text-xs font-medium text-green-600 dark:text-green-400">Стало</p>
                      <p className="text-sm break-all">{formatValue(newVal)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
