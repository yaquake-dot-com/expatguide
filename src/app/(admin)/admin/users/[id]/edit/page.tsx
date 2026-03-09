import { notFound } from "next/navigation"
import { PageHeader } from "@/components/admin/page-header"
import { BreadcrumbSetter } from "@/components/admin/breadcrumb-setter"
import { UserForm } from "@/components/admin/users/user-form"
import { getUserById } from "@/actions/users"
import { db } from "@/lib/db"

interface Props { params: Promise<{ id: string }> }

export default async function EditUserPage({ params }: Props) {
  const { id } = await params
  const user = await getUserById(id)
  if (!user) notFound()

  const countries = await db.country.findMany({
    where: { isActive: true }, orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, flag: true },
  })

  return (
    <div>
      <BreadcrumbSetter id={user.id} label={user.name} />
      <PageHeader title={`Редактировать: ${user.name}`} />
      <UserForm
        countries={countries}
        initialData={{
          id: user.id, name: user.name, nickname: user.nickname || "",
          email: user.email, password: "", role: user.role,
          countryIds: user.countries.map((c) => c.country.id),
        }}
      />
    </div>
  )
}
