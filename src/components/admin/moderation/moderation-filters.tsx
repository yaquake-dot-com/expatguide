"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ModerationFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/admin/moderation?${params.toString()}`)
  }

  return (
    <div className="flex gap-3">
      <Select
        value={searchParams.get("status") || "all"}
        onValueChange={(v) => updateParam("status", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="PENDING">Ожидает</SelectItem>
          <SelectItem value="APPROVED">Одобрено</SelectItem>
          <SelectItem value="REJECTED">Отклонено</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("entityType") || "all"}
        onValueChange={(v) => updateParam("entityType", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Тип" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все типы</SelectItem>
          <SelectItem value="ARTICLE">Статьи</SelectItem>
          <SelectItem value="SPECIALIST">Специалисты</SelectItem>
          <SelectItem value="USEFUL_LINK">Ссылки</SelectItem>
          <SelectItem value="ADVERTISEMENT">Баннеры</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
