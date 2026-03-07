"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Loader2,
  Plus,
  Trash2,
  FileText,
  Link as LinkIcon,
  Smartphone,
  Monitor,
  Apple,
  Download,
  Archive,
  File,
  GripVertical,
} from "lucide-react"
import { attachmentSchema, type AttachmentFormData } from "@/lib/validators/article"
import { createAttachment, deleteAttachment } from "@/actions/articles"
import { FileUpload } from "@/components/admin/file-upload"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"

interface Attachment {
  id: string
  label: string
  type: "FILE" | "EXTERNAL_LINK"
  url: string
  platform: string | null
  fileSize: number | null
  version: string | null
  sortOrder: number
  downloads: number
}

interface AttachmentManagerProps {
  articleId: string
  attachments: Attachment[]
}

const platformIcons: Record<string, React.ReactNode> = {
  ANDROID: <Smartphone className="h-4 w-4" />,
  IOS: <Apple className="h-4 w-4" />,
  WINDOWS: <Monitor className="h-4 w-4" />,
  MACOS: <Apple className="h-4 w-4" />,
  LINUX: <Monitor className="h-4 w-4" />,
  PDF: <FileText className="h-4 w-4" />,
  ZIP: <Archive className="h-4 w-4" />,
  OTHER: <File className="h-4 w-4" />,
}

const platformLabels: Record<string, string> = {
  ANDROID: "Android",
  IOS: "iOS",
  WINDOWS: "Windows",
  MACOS: "macOS",
  LINUX: "Linux",
  PDF: "PDF",
  ZIP: "ZIP",
  OTHER: "Другое",
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return null
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

export function AttachmentManager({ articleId, attachments }: AttachmentManagerProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Вложения ({attachments.length})
          </CardTitle>
          <AddAttachmentDialog articleId={articleId} nextSortOrder={attachments.length} />
        </div>
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Нет вложений. Нажмите «Добавить» чтобы прикрепить файл или ссылку.
          </p>
        ) : (
          <div className="space-y-2">
            {attachments.map((att) => (
              <AttachmentRow key={att.id} attachment={att} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AttachmentRow({ attachment: att }: { attachment: Attachment }) {
  const { execute: execDelete } = useAction(deleteAttachment, {
    onSuccess: () => {
      toast.success("Вложение удалено")
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Ошибка удаления")
    },
  })

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />

      <div className="flex items-center gap-2 shrink-0">
        {att.platform && platformIcons[att.platform]}
        {att.type === "EXTERNAL_LINK" ? (
          <LinkIcon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Download className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{att.label}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate max-w-[300px]">{att.url}</span>
          {att.platform && (
            <Badge variant="outline" className="text-xs">
              {platformLabels[att.platform]}
            </Badge>
          )}
          {att.fileSize && (
            <span>{formatFileSize(att.fileSize)}</span>
          )}
          {att.version && <span>v{att.version}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground">
          {att.downloads} скач.
        </span>
        <ConfirmDialog
          title="Удалить вложение?"
          description="Это действие нельзя отменить."
          onConfirm={() => execDelete({ id: att.id })}
        />
      </div>
    </div>
  )
}

function AddAttachmentDialog({
  articleId,
  nextSortOrder,
}: {
  articleId: string
  nextSortOrder: number
}) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AttachmentFormData>({
    resolver: zodResolver(attachmentSchema),
    defaultValues: {
      label: "",
      type: "FILE",
      url: "",
      platform: null,
      fileSize: null,
      version: null,
      sortOrder: nextSortOrder,
    },
  })

  const attachType = watch("type")
  const fileUrl = watch("url")

  const { execute, isPending } = useAction(createAttachment, {
    onSuccess: () => {
      toast.success("Вложение добавлено")
      reset()
      setOpen(false)
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Ошибка добавления")
    },
  })

  function onSubmit(data: AttachmentFormData) {
    execute({ ...data, articleId })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Добавить
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Добавить вложение</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="att-label">Название *</Label>
            <Input
              id="att-label"
              {...register("label")}
              placeholder="Скачать для Android"
            />
            {errors.label && (
              <p className="text-sm text-destructive">{errors.label.message}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Тип</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FILE">Файл</SelectItem>
                    <SelectItem value="EXTERNAL_LINK">Внешняя ссылка</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* URL / File Upload */}
          <div className="space-y-2">
            <Label>{attachType === "FILE" ? "Файл *" : "URL *"}</Label>
            {attachType === "FILE" ? (
              <div className="space-y-2">
                <FileUpload
                  value={fileUrl || null}
                  onChange={(url) => setValue("url", url || "")}
                  accept="*/*"
                  label="Загрузить файл"
                  showPreview={false}
                />
                {errors.url && (
                  <p className="text-sm text-destructive">{errors.url.message}</p>
                )}
              </div>
            ) : (
              <div>
                <Input
                  {...register("url")}
                  placeholder="https://play.google.com/store/apps/..."
                />
                {errors.url && (
                  <p className="text-sm text-destructive">{errors.url.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <Label>Платформа</Label>
            <Controller
              name="platform"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || "NONE"}
                  onValueChange={(v) => field.onChange(v === "NONE" ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Не указана" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Не указана</SelectItem>
                    <SelectItem value="ANDROID">Android</SelectItem>
                    <SelectItem value="IOS">iOS</SelectItem>
                    <SelectItem value="WINDOWS">Windows</SelectItem>
                    <SelectItem value="MACOS">macOS</SelectItem>
                    <SelectItem value="LINUX">Linux</SelectItem>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="ZIP">ZIP</SelectItem>
                    <SelectItem value="OTHER">Другое</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Version */}
            <div className="space-y-2">
              <Label htmlFor="att-version">Версия</Label>
              <Input
                id="att-version"
                {...register("version")}
                placeholder="1.0.0"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label htmlFor="att-sort">Порядок</Label>
              <Input
                id="att-sort"
                type="number"
                {...register("sortOrder", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Добавить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
