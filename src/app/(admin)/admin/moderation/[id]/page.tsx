import { notFound } from "next/navigation"
import Link from "next/link"
import { getPendingChangeById } from "@/actions/moderation"
import { ModerationDiff } from "@/components/admin/moderation/moderation-diff"
import { ModerationReviewActions } from "@/components/admin/moderation/moderation-review-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

const entityTypeLabels: Record<string, string> = {
  ARTICLE: "Статья",
  SPECIALIST: "Специалист",
  USEFUL_LINK: "Полезная ссылка",
  ADVERTISEMENT: "Баннер",
}

const actionLabels: Record<string, string> = {
  CREATE: "Создание",
  UPDATE: "Редактирование",
  DELETE: "Удаление",
}

const statusLabels: Record<string, string> = {
  PENDING: "Ожидает",
  APPROVED: "Одобрено",
  REJECTED: "Отклонено",
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ModerationReviewPage({ params }: Props) {
  const { id } = await params
  const change = await getPendingChangeById(id)

  if (!change) notFound()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/moderation"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-heading">Ревью изменения</h1>
          <p className="text-sm text-muted-foreground">
            {entityTypeLabels[change.entityType]} — {actionLabels[change.action]}
          </p>
        </div>
      </div>

      {/* Info card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Информация</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Тип</p>
              <Badge variant="outline" className="mt-1">
                {entityTypeLabels[change.entityType]}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Действие</p>
              <Badge
                variant={change.action === "DELETE" ? "destructive" : change.action === "CREATE" ? "default" : "secondary"}
                className="mt-1"
              >
                {actionLabels[change.action]}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Статус</p>
              <Badge
                variant={change.status === "PENDING" ? "default" : change.status === "APPROVED" ? "secondary" : "destructive"}
                className="mt-1"
              >
                {statusLabels[change.status]}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Страна</p>
              <p className="mt-1 text-sm">
                {change.country ? `${change.country.flag} ${change.country.name}` : "Общая"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Автор</p>
              <p className="mt-1 text-sm">{change.author.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Создано</p>
              <p className="mt-1 text-sm">
                {format(new Date(change.createdAt), "dd.MM.yyyy HH:mm", { locale: ru })}
              </p>
            </div>
            {change.reviewer && (
              <div>
                <p className="text-xs text-muted-foreground">Проверил</p>
                <p className="mt-1 text-sm">{change.reviewer.name}</p>
              </div>
            )}
            {change.reviewedAt && (
              <div>
                <p className="text-xs text-muted-foreground">Проверено</p>
                <p className="mt-1 text-sm">
                  {format(new Date(change.reviewedAt), "dd.MM.yyyy HH:mm", { locale: ru })}
                </p>
              </div>
            )}
          </div>
          {change.reviewComment && (
            <div className="mt-4 rounded-lg border bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">Комментарий</p>
              <p className="mt-1 text-sm">{change.reviewComment}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diff */}
      <ModerationDiff
        action={change.action}
        data={change.data as Record<string, unknown> | null}
        diff={change.diff as Record<string, { old: unknown; new: unknown }> | null}
      />

      {/* Review actions */}
      <ModerationReviewActions changeId={change.id} status={change.status} />
    </div>
  )
}
