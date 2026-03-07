"use client"

import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { StatusBadge } from "@/components/admin/status-badge"
import { Pencil } from "lucide-react"
import { deleteAd } from "@/actions/ads"
import { toast } from "sonner"

type AdRow = {
  id: string
  title: string
  slot: string
  isActive: boolean
  startsAt: Date
  endsAt: Date
  impressions: number
  clicks: number
  country: { name: string; flag: string | null } | null
}

const slotLabels: Record<string, string> = {
  HERO_BANNER: "Баннер",
  SIDEBAR: "Сайдбар",
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" })
}

export const adsColumns: ColumnDef<AdRow>[] = [
  {
    accessorKey: "title",
    header: "Название",
  },
  {
    id: "slot",
    header: "Слот",
    cell: ({ row }) => (
      <Badge variant={row.original.slot === "HERO_BANNER" ? "default" : "secondary"}>
        {slotLabels[row.original.slot] || row.original.slot}
      </Badge>
    ),
  },
  {
    id: "country",
    header: "Страна",
    cell: ({ row }) => row.original.country
      ? <span>{row.original.country.flag} {row.original.country.name}</span>
      : <span className="text-muted-foreground">Все</span>,
  },
  {
    id: "dates",
    header: "Период",
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.startsAt)} — {formatDate(row.original.endsAt)}</span>
    ),
  },
  {
    id: "stats",
    header: "Показы / Клики",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.impressions} / {row.original.clicks}</span>
    ),
  },
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
          <Link href={`/admin/ads/${row.original.id}/edit`}><Pencil className="h-4 w-4" /></Link>
        </Button>
        <ConfirmDialog
          title={`Удалить "${row.original.title}"?`}
          onConfirm={async () => {
            const result = await deleteAd({ id: row.original.id })
            if (result?.serverError) toast.error(result.serverError)
            else if (result?.data?.pending) { toast.info("Запрос на удаление отправлен на модерацию"); window.location.reload() }
            else { toast.success("Баннер удален"); window.location.reload() }
          }}
        />
      </div>
    ),
  },
]
