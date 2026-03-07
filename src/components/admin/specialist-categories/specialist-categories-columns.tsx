"use client"

import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Pencil, ArrowUpDown } from "lucide-react"
import { deleteSpecialistCategory } from "@/actions/specialist-categories"
import { toast } from "sonner"

type SpecialistCategoryRow = {
  id: string
  name: string
  slug: string
  icon: string | null
  sortOrder: number
  _count: {
    specialists: number
  }
}

export const specialistCategoriesColumns: ColumnDef<SpecialistCategoryRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Название
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{row.original.slug}</code>
    ),
  },
  {
    accessorKey: "icon",
    header: "Иконка",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.icon || "—"}</span>
    ),
  },
  {
    id: "specialists",
    header: "Специалисты",
    cell: ({ row }) => row.original._count.specialists,
  },
  {
    accessorKey: "sortOrder",
    header: "Порядок",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/specialist-categories/${row.original.id}/edit`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
        <ConfirmDialog
          title={`Удалить "${row.original.name}"?`}
          description={
            row.original._count.specialists > 0
              ? `У этой категории ${row.original._count.specialists} специалистов. Сначала переместите их.`
              : "Категория будет удалена безвозвратно."
          }
          onConfirm={async () => {
            const result = await deleteSpecialistCategory({ id: row.original.id })
            if (result?.serverError) {
              toast.error(result.serverError)
            } else {
              toast.success("Категория удалена")
              window.location.reload()
            }
          }}
        />
      </div>
    ),
  },
]
