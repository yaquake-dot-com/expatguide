import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CountrySelector } from "./country-selector"
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants"
import { db } from "@/lib/db"
import { getSiteSettings } from "@/actions/settings"
import { getTheme } from "@/lib/theme"
import { cn } from "@/lib/utils"

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
  const settings = await getSiteSettings()
  const siteName = settings.siteName || SITE_NAME
  const theme = await getTheme()
  const isNeobrutalism = theme === "neobrutalism"

  const homeItem = { label: "Главная", href: countrySlug ? `/${countrySlug}` : "/" }
  const navItems = [
    homeItem,
    ...NAV_ITEMS.map((item) => ({
      ...item,
      href: countrySlug ? `/${countrySlug}${item.href}` : item.href,
    })),
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b",
        isNeobrutalism
          ? "border-sidebar-border bg-sidebar text-sidebar-foreground"
          : "border-border bg-white"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href={countrySlug ? `/${countrySlug}` : "/"}
          className="flex items-center gap-2"
        >
          <span
            className={cn(
              "text-xl font-bold font-heading",
              isNeobrutalism ? "text-sidebar-primary" : "text-primary"
            )}
          >
            {siteName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isNeobrutalism
                  ? "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  : "text-foreground/80 hover:bg-accent hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side: Country selector + Search + Mobile menu */}
        <div className="flex items-center gap-1">
          <CountrySelector countries={countries} currentSlug={countrySlug} isNeobrutalism={isNeobrutalism} />

          {/* Mobile burger menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Меню</SheetTitle>
              <nav className="mt-12 flex flex-col gap-1">
                {navItems.map((item) => (
                  <SheetClose key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "rounded-md px-3 py-3 text-base font-medium transition-colors",
                        isNeobrutalism
                          ? "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                          : "text-foreground/80 hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
