"use client"

import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Pencil, ArrowUpDown, Paperclip } from "lucide-react"
import { deleteArticle } from "@/actions/articles"
import { toast } from "sonner"

type ArticleRow = {
  id: string
  title: string
  slug: string
  type: "COUNTRY" | "GENERAL"
  status: "DRAFT" | "PUBLISHED"
  country: { name: string; flag: string | null } | null
  category: { name: string }
  author: { name: string }
  _count: { attachments: number }
  createdAt: Date
}

export const articlesColumns: ColumnDef<ArticleRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Заголовок
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        <p className="font-medium truncate">{row.original.title}</p>
        <p className="text-xs text-muted-foreground truncate">{row.original.slug}</p>
      </div>
    ),
  },
  {
    id: "type",
    header: "Тип",
    cell: ({ row }) => (
      <Badge variant={row.original.type === "COUNTRY" ? "default" : "secondary"}>
        {row.original.type === "COUNTRY" ? "Страновая" : "Общая"}
      </Badge>
    ),
  },
  {
    id: "country",
    header: "Страна",
    cell: ({ row }) =>
      row.original.country ? (
        <span className="text-sm">
          {row.original.country.flag} {row.original.country.name}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    id: "category",
    header: "Категория",
    cell: ({ row }) => (
      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
        {row.original.category.name}
      </span>
    ),
  },
  {
    id: "attachments",
    header: "",
    cell: ({ row }) =>
      row.original._count.attachments > 0 ? (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Paperclip className="h-3 w-3" />
          {row.original._count.attachments}
        </span>
      ) : null,
  },
  {
    id: "status",
    header: "Статус",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "PUBLISHED" ? "default" : "outline"}
        className={
          row.original.status === "PUBLISHED"
            ? "bg-green-100 text-green-800 hover:bg-green-100"
            : ""
        }
      >
        {row.original.status === "PUBLISHED" ? "Опубликована" : "Черновик"}
      </Badge>
    ),
  },
  {
    id: "author",
    header: "Автор",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.author.name}</span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/articles/${row.original.id}/edit`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
        <ConfirmDialog
          title={`Удалить "${row.original.title}"?`}
          description="Статья и все вложения будут удалены безвозвратно."
          onConfirm={async () => {
            const result = await deleteArticle({ id: row.original.id })
            if (result?.serverError) {
              toast.error(result.serverError)
            } else if (result?.data?.pending) {
              toast.info("Запрос на удаление отправлен на модерацию")
            } else {
              toast.success("Статья удалена")
              window.location.reload()
            }
          }}
        />
      </div>
    ),
  },
]
