"use client"

import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/admin/status-badge"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Pencil, ArrowUpDown } from "lucide-react"
import { deleteCountry } from "@/actions/countries"
import { toast } from "sonner"

type CountryRow = {
  id: string
  name: string
  slug: string
  code: string
  flag: string | null
  isActive: boolean
  sortOrder: number
  _count: {
    cities: number
    specialists: number
    articles: number
  }
}

export const countriesColumns: ColumnDef<CountryRow>[] = [
  {
    accessorKey: "flag",
    header: "",
    cell: ({ row }) => (
      <span className="text-xl">{row.original.flag || "🏳️"}</span>
    ),
    size: 50,
  },
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
    accessorKey: "code",
    header: "Код",
    cell: ({ row }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{row.original.code}</code>
    ),
  },
  {
    id: "cities",
    header: "Города",
    cell: ({ row }) => row.original._count.cities,
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
          <Link href={`/admin/countries/${row.original.id}/edit`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
        <ConfirmDialog
          title={`Удалить ${row.original.name}?`}
          description="Все города и связанные данные этой страны будут удалены."
          onConfirm={async () => {
            const result = await deleteCountry({ id: row.original.id })
            if (result?.serverError) {
              toast.error(result.serverError)
            } else {
              toast.success("Страна удалена")
              window.location.reload()
            }
          }}
        />
      </div>
    ),
  },
]
