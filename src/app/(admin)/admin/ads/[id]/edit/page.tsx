import { notFound } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { BreadcrumbSetter } from "@/components/admin/breadcrumb-setter"
import { AdForm } from "@/components/admin/ads/ad-form"
import { getAdById } from "@/actions/ads"
import { getUserCountryScope } from "@/lib/safe-action"
import { db } from "@/lib/db"

interface Props { params: Promise<{ id: string }> }

export default async function EditAdPage({ params }: Props) {
  const { id } = await params
  const ad = await getAdById(id)
  if (!ad) notFound()

  const countryScope = await getUserCountryScope()
  const countries = await db.country.findMany({
    where: {
      isActive: true,
      ...(countryScope ? { id: { in: countryScope } } : {}),
    },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, flag: true },
  })

  // Format dates as YYYY-MM-DD for date inputs
  const formatDate = (d: Date) => new Date(d).toISOString().split("T")[0]

  return (
    <div>
      <BreadcrumbSetter id={ad.id} label={ad.title} />
      <PageHeader title={`Редактировать: ${ad.title}`} />
      <AdForm
        countries={countries}
        initialData={{
          id: ad.id, title: ad.title, imageUrl: ad.imageUrl,
          htmlContent: ad.htmlContent, targetUrl: ad.targetUrl,
          slot: ad.slot, countryId: ad.countryId,
          startsAt: formatDate(ad.startsAt), endsAt: formatDate(ad.endsAt),
          isActive: ad.isActive,
        }}
      />
    </div>
  )
}
