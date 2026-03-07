"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { useState } from "react"

const LANGUAGE_OPTIONS = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "th", label: "ไทย" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "he", label: "עברית" },
  { value: "tr", label: "Türkçe" },
]

interface DirectoryFiltersProps {
  cities: { id: string; name: string }[]
  categories: { id: string; name: string }[]
  countrySlug: string
}

export function DirectoryFilters({
  cities,
  categories,
  countrySlug,
}: DirectoryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete("page")
    router.push(`/${countrySlug}/directory?${params.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParams("q", query)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <form onSubmit={handleSearch} className="relative flex-1 sm:min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по имени..."
          className="pl-9"
        />
      </form>

      <Select
        value={searchParams.get("city") || "all"}
        onValueChange={(v) => updateParams("city", v)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Город" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все города</SelectItem>
          {cities.map((city) => (
            <SelectItem key={city.id} value={city.id}>
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("category") || "all"}
        onValueChange={(v) => updateParams("category", v)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Категория" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все категории</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("language") || "all"}
        onValueChange={(v) => updateParams("language", v)}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Язык" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все языки</SelectItem>
          {LANGUAGE_OPTIONS.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
