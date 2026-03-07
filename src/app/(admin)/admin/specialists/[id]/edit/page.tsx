import { notFound } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { SpecialistForm } from "@/components/admin/specialists/specialist-form"
import { getSpecialistById } from "@/actions/specialists"
import { getUserCountryScope } from "@/lib/safe-action"
import { db } from "@/lib/db"

interface EditSpecialistPageProps {
  params: Promise<{ id: string }>
}

export default async function EditSpecialistPage({ params }: EditSpecialistPageProps) {
  const { id } = await params
  const specialist = await getSpecialistById(id)

  if (!specialist) {
    notFound()
  }

  const countryScope = await getUserCountryScope()
  const [countries, categories] = await Promise.all([
    db.country.findMany({
      where: {
        isActive: true,
        ...(countryScope ? { id: { in: countryScope } } : {}),
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        flag: true,
        cities: {
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        },
      },
    }),
    db.specialistCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ])

  const socialLinks = specialist.socialLinks as {
    telegram?: string
    whatsapp?: string
    instagram?: string
    facebook?: string
  } | null

  return (
    <div>
      <PageHeader title={`Редактировать: ${specialist.name}`} />
      <SpecialistForm
        countries={countries}
        categories={categories}
        initialData={{
          id: specialist.id,
          name: specialist.name,
          description: specialist.description,
          phone: specialist.phone,
          email: specialist.email,
          website: specialist.website,
          address: specialist.address,
          image: specialist.image,
          socialLinks: socialLinks || {
            telegram: "",
            whatsapp: "",
            instagram: "",
            facebook: "",
          },
          countryId: specialist.countryId,
          cityId: specialist.cityId || "",
          categoryId: specialist.categoryId,
          languages: specialist.languages,
          isActive: specialist.isActive,
        }}
      />
    </div>
  )
}
