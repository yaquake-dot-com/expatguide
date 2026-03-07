"use client"

import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Pencil, ArrowUpDown } from "lucide-react"
import { deleteCity } from "@/actions/cities"
import { toast } from "sonner"

type CityRow = {
  id: string
  name: string
  slug: string
  country: {
    name: string
    flag: string | null
    slug: string
  }
  _count: {
    specialists: number
  }
}

export const citiesColumns: ColumnDef<CityRow>[] = [
  {
    id: "country",
    header: "Страна",
    cell: ({ row }) => (
      <span>
        {row.original.country.flag} {row.original.country.name}
      </span>
    ),
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
    id: "specialists",
    header: "Специалисты",
    cell: ({ row }) => row.original._count.specialists,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/cities/${row.original.id}/edit`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
        <ConfirmDialog
          title={`Удалить ${row.original.name}?`}
          description="Все специалисты этого города будут удалены."
          onConfirm={async () => {
            const result = await deleteCity({ id: row.original.id })
            if (result?.serverError) {
              toast.error(result.serverError)
            } else {
              toast.success("Город удалён")
              window.location.reload()
            }
          }}
        />
      </div>
    ),
  },
]
