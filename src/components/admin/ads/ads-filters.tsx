"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface AdsFiltersProps {
  countries: { id: string; name: string; flag: string | null }[]
}

export function AdsFilters({ countries }: AdsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const slot = searchParams.get("slot") || ""
  const countryId = searchParams.get("countryId") || ""

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    value ? params.set(key, value) : params.delete(key)
    router.push(`/admin/ads?${params.toString()}`)
  }

  const hasFilters = slot || countryId

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={slot} onValueChange={(v) => updateFilter("slot", v)}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Все слоты" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="HERO_BANNER">Главный баннер</SelectItem>
          <SelectItem value="SIDEBAR">Боковая панель</SelectItem>
        </SelectContent>
      </Select>
      <Select value={countryId} onValueChange={(v) => updateFilter("countryId", v)}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Все страны" /></SelectTrigger>
        <SelectContent>
          {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.flag} {c.name}</SelectItem>)}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/ads")}>
          <X className="mr-1 h-4 w-4" /> Сбросить
        </Button>
      )}
    </div>
  )
}
