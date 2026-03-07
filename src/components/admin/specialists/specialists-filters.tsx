"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface Country {
  id: string
  name: string
  flag: string | null
}

interface Category {
  id: string
  name: string
}

interface SpecialistsFiltersProps {
  countries: Country[]
  categories: Category[]
}

export function SpecialistsFilters({ countries, categories }: SpecialistsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const countryId = searchParams.get("countryId") || ""
  const categoryId = searchParams.get("categoryId") || ""

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/admin/specialists?${params.toString()}`)
  }

  function clearFilters() {
    router.push("/admin/specialists")
  }

  const hasFilters = countryId || categoryId

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={countryId}
        onValueChange={(val) => updateFilter("countryId", val)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Все страны" />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.id} value={country.id}>
              {country.flag} {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={categoryId}
        onValueChange={(val) => updateFilter("categoryId", val)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Все категории" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Сбросить
        </Button>
      )}
    </div>
  )
}
