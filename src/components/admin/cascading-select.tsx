"use client"

import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Country {
  id: string
  name: string
  flag: string | null
  cities: { id: string; name: string }[]
}

interface CascadingSelectProps {
  countries: Country[]
  countryId: string
  cityId: string
  onCountryChange: (countryId: string) => void
  onCityChange: (cityId: string) => void
  countryError?: string
  cityError?: string
  disabled?: boolean
}

export function CascadingSelect({
  countries,
  countryId,
  cityId,
  onCountryChange,
  onCityChange,
  countryError,
  cityError,
  disabled,
}: CascadingSelectProps) {
  const [cities, setCities] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    if (countryId) {
      const country = countries.find((c) => c.id === countryId)
      setCities(country?.cities || [])
    } else {
      setCities([])
    }
  }, [countryId, countries])

  function handleCountryChange(value: string) {
    onCountryChange(value)
    onCityChange("") // Reset city when country changes
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Country */}
      <div className="space-y-2">
        <Label>Страна *</Label>
        <Select
          value={countryId}
          onValueChange={handleCountryChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите страну" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.id} value={country.id}>
                {country.flag} {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {countryError && (
          <p className="text-sm text-destructive">{countryError}</p>
        )}
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label>Город</Label>
        <Select
          value={cityId || "__any__"}
          onValueChange={(v) => onCityChange(v === "__any__" ? "" : v)}
          disabled={!countryId || disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={countryId ? "Выберите город" : "Сначала выберите страну"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__any__">🌍 Любой город</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {cityError && (
          <p className="text-sm text-destructive">{cityError}</p>
        )}
      </div>
    </div>
  )
}
