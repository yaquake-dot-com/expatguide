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

interface ArticlesFiltersProps {
  countries: Country[]
  categories: Category[]
}

export function ArticlesFilters({ countries, categories }: ArticlesFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const type = searchParams.get("type") || ""
  const countryId = searchParams.get("countryId") || ""
  const categoryId = searchParams.get("categoryId") || ""
  const status = searchParams.get("status") || ""

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/admin/articles?${params.toString()}`)
  }

  function clearFilters() {
    router.push("/admin/articles")
  }

  const hasFilters = type || countryId || categoryId || status

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={type} onValueChange={(val) => updateFilter("type", val)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Все типы" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="COUNTRY">Страновые</SelectItem>
          <SelectItem value="GENERAL">Общие</SelectItem>
        </SelectContent>
      </Select>

      <Select value={countryId} onValueChange={(val) => updateFilter("countryId", val)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Все страны" />
        </SelectTrigger>
        <SelectContent>
          {countries.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.flag} {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoryId} onValueChange={(val) => updateFilter("categoryId", val)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Все категории" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(val) => updateFilter("status", val)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Все статусы" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="DRAFT">Черновики</SelectItem>
          <SelectItem value="PUBLISHED">Опубликованные</SelectItem>
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
