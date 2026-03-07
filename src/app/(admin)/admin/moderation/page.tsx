import { PageHeader } from "@/components/admin/page-header"
import { DataTable } from "@/components/admin/data-table"
import { moderationColumns } from "@/components/admin/moderation/moderation-columns"
import { ModerationFilters } from "@/components/admin/moderation/moderation-filters"
import { BulkApproveButton } from "@/components/admin/moderation/bulk-approve-button"
import { getPendingChanges } from "@/actions/moderation"

interface Props {
  searchParams: Promise<{ status?: string; entityType?: string }>
}

export default async function ModerationPage({ searchParams }: Props) {
  const params = await searchParams
  const changes = await getPendingChanges({
    status: params.status,
    entityType: params.entityType,
  })

  const pendingIds = changes
    .filter((c) => c.status === "PENDING")
    .map((c) => c.id)

  return (
    <div>
      <PageHeader
        title="Модерация"
        description="Очередь изменений от администраторов стран"
      />
      <div className="mb-4 flex items-center justify-between">
        <ModerationFilters />
        <BulkApproveButton pendingIds={pendingIds} />
      </div>
      <DataTable
        columns={moderationColumns}
        data={changes}
        searchKey="entityType"
        searchPlaceholder="Поиск..."
      />
    </div>
  )
}
