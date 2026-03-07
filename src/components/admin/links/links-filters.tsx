"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface LinksFiltersProps {
  countries: { id: string; name: string; flag: string | null }[]
  categories: { id: string; name: string }[]
}

export function LinksFilters({ countries, categories }: LinksFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const countryId = searchParams.get("countryId") || ""
  const categoryId = searchParams.get("categoryId") || ""

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    value ? params.set(key, value) : params.delete(key)
    router.push(`/admin/links?${params.toString()}`)
  }

  const hasFilters = countryId || categoryId

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={countryId} onValueChange={(v) => updateFilter("countryId", v)}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Все страны" /></SelectTrigger>
        <SelectContent>
          {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.flag} {c.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={categoryId} onValueChange={(v) => updateFilter("categoryId", v)}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Все категории" /></SelectTrigger>
        <SelectContent>
          {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/links")}>
          <X className="mr-1 h-4 w-4" /> Сбросить
        </Button>
      )}
    </div>
  )
}
