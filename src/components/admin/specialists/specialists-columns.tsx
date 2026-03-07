"use client"

import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/admin/status-badge"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Pencil, ArrowUpDown } from "lucide-react"
import { deleteSpecialist } from "@/actions/specialists"
import { toast } from "sonner"

type SpecialistRow = {
  id: string
  name: string
  phone: string | null
  email: string | null
  isActive: boolean
  country: {
    name: string
    flag: string | null
  }
  city: {
    name: string
  } | null
  category: {
    name: string
  }
}

export const specialistsColumns: ColumnDef<SpecialistRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Имя
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
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
    id: "location",
    header: "Расположение",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.country.flag} {row.original.city?.name || "Все города"}, {row.original.country.name}
      </span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Телефон",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.phone || "—"}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Статус",
    cell: ({ row }) => <StatusBadge active={row.original.isActive} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/specialists/${row.original.id}/edit`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
        <ConfirmDialog
          title={`Удалить ${row.original.name}?`}
          description="Специалист будет удалён безвозвратно."
          onConfirm={async () => {
            const result = await deleteSpecialist({ id: row.original.id })
            if (result?.serverError) {
              toast.error(result.serverError)
            } else if (result?.data?.pending) {
              toast.info("Запрос на удаление отправлен на модерацию")
            } else {
              toast.success("Специалист удалён")
              window.location.reload()
            }
          }}
        />
      </div>
    ),
  },
]
