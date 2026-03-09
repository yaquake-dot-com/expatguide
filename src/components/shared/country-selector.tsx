"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe, Check } from "lucide-react"
import { COUNTRY_COOKIE_NAME, COUNTRY_COOKIE_MAX_AGE } from "@/lib/constants"

interface Country {
  id: string
  name: string
  slug: string
  flag: string | null
}

interface CountrySelectorProps {
  countries: Country[]
  currentSlug?: string
  isNeobrutalism?: boolean
}

export function CountrySelector({ countries, currentSlug, isNeobrutalism }: CountrySelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [selected, setSelected] = useState(currentSlug || "")

  useEffect(() => {
    // Extract country slug from pathname
    const segments = pathname.split("/").filter(Boolean)
    const firstSegment = segments[0]
    const matchingCountry = countries.find((c) => c.slug === firstSegment)
    if (matchingCountry) {
      setSelected(matchingCountry.slug)
    }
  }, [pathname, countries])

  const currentCountry = countries.find((c) => c.slug === selected)

  function handleSelect(slug: string) {
    // Set cookie
    document.cookie = `${COUNTRY_COOKIE_NAME}=${slug}; path=/; max-age=${COUNTRY_COOKIE_MAX_AGE}`
    setSelected(slug)

    // Navigate: replace country segment in URL
    const segments = pathname.split("/").filter(Boolean)
    const currentCountrySlugs = countries.map((c) => c.slug)
    if (segments[0] && currentCountrySlugs.includes(segments[0])) {
      segments[0] = slug
      router.push("/" + segments.join("/"))
    } else {
      router.push("/" + slug)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isNeobrutalism ? "outline" : "ghost"}
          size="sm"
          className={cn(
            "gap-1.5",
            isNeobrutalism && "border-amber-700 bg-amber-600/20 text-amber-950 hover:bg-amber-600/30"
          )}
        >
          {currentCountry ? (
            <>
              <span>{currentCountry.flag}</span>
              <span className="hidden sm:inline">{currentCountry.name}</span>
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Страна</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {countries.map((country) => (
          <DropdownMenuItem
            key={country.id}
            onClick={() => handleSelect(country.slug)}
            className="gap-2"
          >
            <span>{country.flag}</span>
            <span>{country.name}</span>
            {selected === country.slug && (
              <Check className="ml-auto h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
