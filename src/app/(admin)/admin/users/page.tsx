import { PageHeader } from "@/components/admin/page-header"
import { DataTable } from "@/components/admin/data-table"
import { usersColumns } from "@/components/admin/users/users-columns"
import { getUsers } from "@/actions/users"

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div>
      <PageHeader
        title="Пользователи"
        description="Управление администраторами портала"
        createHref="/admin/users/new"
        createLabel="Новый пользователь"
      />
      <DataTable columns={usersColumns} data={users} searchKey="name" searchPlaceholder="Поиск по имени..." />
    </div>
  )
}
