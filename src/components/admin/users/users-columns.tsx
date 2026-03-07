"use client"

import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Pencil } from "lucide-react"
import { deleteUser } from "@/actions/users"
import { toast } from "sonner"

type UserRow = {
  id: string
  name: string
  nickname: string | null
  email: string
  role: string
  countries: { country: { name: string; flag: string | null } }[]
  _count: { articles: number }
}

export const usersColumns: ColumnDef<UserRow>[] = [
  {
    accessorKey: "name",
    header: "Имя",
    cell: ({ row }) => (
      <div>
        <span>{row.original.name}</span>
        {row.original.nickname && (
          <span className="ml-2 text-xs text-muted-foreground">@{row.original.nickname}</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.email}</span>,
  },
  {
    id: "role",
    header: "Роль",
    cell: ({ row }) => (
      <Badge variant={row.original.role === "SUPER_ADMIN" ? "destructive" : "default"}>
        {row.original.role === "SUPER_ADMIN" ? "Суперадмин" : "Админ страны"}
      </Badge>
    ),
  },
  {
    id: "countries",
    header: "Страны",
    cell: ({ row }) => {
      if (row.original.role === "SUPER_ADMIN") return <span className="text-muted-foreground">Все</span>
      const countries = row.original.countries
      if (countries.length === 0) return <span className="text-muted-foreground">—</span>
      return <span className="text-sm">{countries.map((c) => `${c.country.flag} ${c.country.name}`).join(", ")}</span>
    },
  },
  {
    id: "articles",
    header: "Статей",
    cell: ({ row }) => row.original._count.articles,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/users/${row.original.id}/edit`}><Pencil className="h-4 w-4" /></Link>
        </Button>
        <ConfirmDialog
          title={`Удалить "${row.original.name}"?`}
          description="Все статьи этого пользователя останутся."
          onConfirm={async () => {
            const result = await deleteUser({ id: row.original.id })
            if (result?.serverError) toast.error(result.serverError)
            else { toast.success("Пользователь удален"); window.location.reload() }
          }}
        />
      </div>
    ),
  },
]
