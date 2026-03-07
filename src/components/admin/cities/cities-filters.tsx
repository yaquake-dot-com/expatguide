"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface CitiesFiltersProps {
  countries: { id: string; name: string; flag: string | null }[]
}

export function CitiesFilters({ countries }: CitiesFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const countryId = searchParams.get("countryId") || ""

  function updateFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    value ? params.set("countryId", value) : params.delete("countryId")
    router.push(`/admin/cities?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={countryId} onValueChange={updateFilter}>
        <SelectTrigger className="w-[200px]"><SelectValue placeholder="Все страны" /></SelectTrigger>
        <SelectContent>
          {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.flag} {c.name}</SelectItem>)}
        </SelectContent>
      </Select>
      {countryId && (
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/cities")}>
          <X className="mr-1 h-4 w-4" /> Сбросить
        </Button>
      )}
    </div>
  )
}
