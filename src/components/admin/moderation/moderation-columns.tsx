"use client"

import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"

const entityTypeLabels: Record<string, string> = {
  ARTICLE: "Статья",
  SPECIALIST: "Специалист",
  USEFUL_LINK: "Ссылка",
  ADVERTISEMENT: "Баннер",
}

const actionLabels: Record<string, string> = {
  CREATE: "Создание",
  UPDATE: "Изменение",
  DELETE: "Удаление",
}

const statusLabels: Record<string, string> = {
  PENDING: "Ожидает",
  APPROVED: "Одобрено",
  REJECTED: "Отклонено",
}

type PendingChangeRow = {
  id: string
  entityType: string
  action: string
  status: string
  createdAt: Date
  reviewedAt: Date | null
  author: { name: string; email: string }
  reviewer: { name: string } | null
  country: { name: string; flag: string | null } | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}

export const moderationColumns: ColumnDef<PendingChangeRow>[] = [
  {
    id: "entityType",
    header: "Тип",
    cell: ({ row }) => (
      <Badge variant="outline">
        {entityTypeLabels[row.original.entityType] || row.original.entityType}
      </Badge>
    ),
  },
  {
    id: "action",
    header: "Действие",
    cell: ({ row }) => {
      const action = row.original.action
      const variant = action === "CREATE" ? "default" : action === "DELETE" ? "destructive" : "secondary"
      return (
        <Badge variant={variant}>
          {actionLabels[action] || action}
        </Badge>
      )
    },
  },
  {
    id: "description",
    header: "Описание",
    cell: ({ row }) => {
      const data = row.original.data as Record<string, unknown> | null
      const name = data?.title || data?.name || "—"
      return <span className="font-medium">{String(name)}</span>
    },
  },
  {
    id: "country",
    header: "Страна",
    cell: ({ row }) => row.original.country
      ? <span>{row.original.country.flag} {row.original.country.name}</span>
      : <span className="text-muted-foreground">Общая</span>,
  },
  {
    id: "author",
    header: "Автор",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.author.name}</span>
    ),
  },
  {
    id: "status",
    header: "Статус",
    cell: ({ row }) => {
      const status = row.original.status
      const variant = status === "PENDING" ? "default" : status === "APPROVED" ? "secondary" : "destructive"
      return (
        <Badge variant={variant}>
          {statusLabels[status] || status}
        </Badge>
      )
    },
  },
  {
    id: "createdAt",
    header: "Когда",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true, locale: ru })}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/admin/moderation/${row.original.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
    ),
  },
]
