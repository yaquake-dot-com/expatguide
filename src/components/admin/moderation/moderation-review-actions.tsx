"use client"

import { useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { approvePendingChange, rejectPendingChange } from "@/actions/moderation"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Check, X, Loader2 } from "lucide-react"

interface ModerationReviewActionsProps {
  changeId: string
  status: string
}

export function ModerationReviewActions({ changeId, status }: ModerationReviewActionsProps) {
  const router = useRouter()
  const [comment, setComment] = useState("")

  const { execute: execApprove, isPending: approving } = useAction(approvePendingChange, {
    onSuccess: () => {
      toast.success("Изменение одобрено")
      router.push("/admin/moderation")
    },
    onError: ({ error }) => {
      toast.error(error?.serverError || "Ошибка при одобрении")
    },
  })

  const { execute: execReject, isPending: rejecting } = useAction(rejectPendingChange, {
    onSuccess: () => {
      toast.success("Изменение отклонено")
      router.push("/admin/moderation")
    },
    onError: ({ error }) => {
      toast.error(error?.serverError || "Ошибка при отклонении")
    },
  })

  if (status !== "PENDING") {
    return (
      <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
        Это изменение уже обработано ({status === "APPROVED" ? "одобрено" : "отклонено"}).
      </div>
    )
  }

  const isLoading = approving || rejecting

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="comment">Комментарий (опционально)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Комментарий к решению..."
          className="mt-1.5"
        />
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => execApprove({ id: changeId, comment: comment || undefined })}
          disabled={isLoading}
          className="gap-2"
        >
          {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Одобрить
        </Button>
        <Button
          variant="destructive"
          onClick={() => execReject({ id: changeId, comment: comment || undefined })}
          disabled={isLoading}
          className="gap-2"
        >
          {rejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          Отклонить
        </Button>
      </div>
    </div>
  )
}
