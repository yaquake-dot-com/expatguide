import { PageHeader } from "@/components/admin/page-header"
import { UserForm } from "@/components/admin/users/user-form"
import { db } from "@/lib/db"

export default async function NewUserPage() {
  const countries = await db.country.findMany({
    where: { isActive: true }, orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, flag: true },
  })

  return (
    <div>
      <PageHeader title="Новый пользователь" />
      <UserForm countries={countries} />
    </div>
  )
}
