"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface FileUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  accept?: string
  label?: string
  showPreview?: boolean
}

export function FileUpload({
  value,
  onChange,
  accept = "image/*",
  label = "Загрузить файл",
  showPreview = true,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      const data = await response.json()
      onChange(data.url)
      toast.success("Файл загружен")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка загрузки")
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function handleRemove() {
    onChange(null)
  }

  return (
    <div className="space-y-3">
      {value && showPreview && accept.startsWith("image") && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="h-32 w-auto rounded-lg border object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {value && !showPreview && (
        <div className="flex items-center gap-2 rounded-md border p-2 text-sm">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate">{value}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleUpload}
          disabled={isUploading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {label}
        </Button>
      </div>
    </div>
  )
}
