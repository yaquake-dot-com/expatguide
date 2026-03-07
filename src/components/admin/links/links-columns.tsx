"use client"

import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { StatusBadge } from "@/components/admin/status-badge"
import { Pencil, ArrowUpDown } from "lucide-react"
import { deleteLink } from "@/actions/links"
import { toast } from "sonner"

type LinkRow = {
  id: string
  title: string
  url: string
  sortOrder: number
  isActive: boolean
  country: { name: string; flag: string | null } | null
  category: { name: string }
}

export const linksColumns: ColumnDef<LinkRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" className="-ml-3" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Название <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.title}</p>
        <p className="text-xs text-muted-foreground truncate max-w-[300px]">{row.original.url}</p>
      </div>
    ),
  },
  {
    id: "category",
    header: "Категория",
    cell: ({ row }) => <Badge variant="outline">{row.original.category.name}</Badge>,
  },
  {
    id: "country",
    header: "Страна",
    cell: ({ row }) => row.original.country
      ? <span>{row.original.country.flag} {row.original.country.name}</span>
      : <span className="text-muted-foreground">Общая</span>,
  },
  { accessorKey: "sortOrder", header: "Порядок" },
  {
    id: "status",
    header: "Статус",
    cell: ({ row }) => <StatusBadge active={row.original.isActive} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/links/${row.original.id}/edit`}><Pencil className="h-4 w-4" /></Link>
        </Button>
        <ConfirmDialog
          title={`Удалить "${row.original.title}"?`}
          onConfirm={async () => {
            const result = await deleteLink({ id: row.original.id })
            if (result?.serverError) toast.error(result.serverError)
            else if (result?.data?.pending) { toast.info("Запрос на удаление отправлен на модерацию"); window.location.reload() }
            else { toast.success("Ссылка удалена"); window.location.reload() }
          }}
        />
      </div>
    ),
  },
]
