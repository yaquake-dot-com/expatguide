import Link from "next/link"
import { SITE_NAME, NAV_ITEMS } from "@/lib/constants"
import { getSiteSettings } from "@/actions/settings"

interface FooterProps {
  countrySlug?: string
}

export async function Footer({ countrySlug }: FooterProps) {
  const settings = await getSiteSettings()
  const siteName = settings.siteName || SITE_NAME
  const currentYear = new Date().getFullYear()
  const prefix = countrySlug ? `/${countrySlug}` : ""

  const homeItem = { label: "Главная", href: `${prefix}/` }
  const navItems = [
    homeItem,
    ...NAV_ITEMS.map((item) => ({
      ...item,
      href: `${prefix}${item.href}`,
    })),
  ]

  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Top row: logo + nav + copyright */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Link href={`${prefix}/`} className="text-lg font-bold text-primary font-heading">
              {siteName}
            </Link>
          </div>

          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {siteName}
          </p>
        </div>

        {/* Bottom row: site description */}
        <div className="mt-6 border-t border-border pt-6 text-center">
          <p className="mx-auto max-w-xl text-sm text-muted-foreground">
            Портал для русскоязычных эмигрантов, туристов и мигрантов за рубежом.
            Справочник специалистов, полезные статьи и ссылки для комфортной жизни в новой стране.
          </p>
        </div>
      </div>
    </footer>
  )
}
