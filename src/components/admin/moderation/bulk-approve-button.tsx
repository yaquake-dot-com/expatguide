"use client"

import { useAction } from "next-safe-action/hooks"
import { Button } from "@/components/ui/button"
import { bulkApprovePendingChanges } from "@/actions/moderation"
import { toast } from "sonner"
import { CheckCheck, Loader2 } from "lucide-react"

interface BulkApproveButtonProps {
  pendingIds: string[]
}

export function BulkApproveButton({ pendingIds }: BulkApproveButtonProps) {
  const { execute, isPending } = useAction(bulkApprovePendingChanges, {
    onSuccess: ({ data }) => {
      if (data) {
        toast.success(`Одобрено: ${data.approved}${data.errors > 0 ? `, ошибок: ${data.errors}` : ""}`)
        window.location.reload()
      }
    },
    onError: ({ error }) => {
      toast.error(error?.serverError || "Ошибка")
    },
  })

  if (pendingIds.length === 0) return null

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={() => execute({ ids: pendingIds })}
      disabled={isPending}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
      Одобрить все ({pendingIds.length})
    </Button>
  )
}
