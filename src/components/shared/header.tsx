import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CountrySelector } from "./country-selector"
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants"
import { db } from "@/lib/db"

async function getCountries() {
  return db.country.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true, flag: true },
  })
}

interface HeaderProps {
  countrySlug?: string
}

export async function Header({ countrySlug }: HeaderProps) {
  const countries = await getCountries()

  const homeItem = { label: "Главная", href: countrySlug ? `/${countrySlug}` : "/" }
  const navItems = [
    homeItem,
    ...NAV_ITEMS.map((item) => ({
      ...item,
      href: countrySlug ? `/${countrySlug}${item.href}` : item.href,
    })),
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href={countrySlug ? `/${countrySlug}` : "/"}
          className="flex items-center gap-2"
        >
          <span className="text-xl font-bold text-primary font-heading">
            {SITE_NAME}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side: Country selector + Search + Mobile menu */}
        <div className="flex items-center gap-1">
          <CountrySelector countries={countries} currentSlug={countrySlug} />

          {/* Mobile burger menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-8 flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
