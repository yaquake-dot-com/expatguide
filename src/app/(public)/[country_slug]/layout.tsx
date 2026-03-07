import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Header } from "@/components/shared/header"
import { Footer } from "@/components/shared/footer"

interface CountryLayoutProps {
  children: React.ReactNode
  params: Promise<{ country_slug: string }>
}

export default async function CountryLayout({
  children,
  params,
}: CountryLayoutProps) {
  const { country_slug } = await params

  const country = await db.country.findUnique({
    where: { slug: country_slug, isActive: true },
  })

  if (!country) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header countrySlug={country_slug} />
      <main className="flex-1">{children}</main>
      <Footer countrySlug={country_slug} />
    </div>
  )
}
