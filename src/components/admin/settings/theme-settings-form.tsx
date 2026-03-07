"use client"

import { useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Check } from "lucide-react"
import { updateTheme } from "@/actions/settings"
import type { ThemeName } from "@/lib/theme"

interface Props {
  currentTheme: ThemeName
}

const themes: { id: ThemeName; name: string; description: string; preview: React.ReactNode }[] = [
  {
    id: "default",
    name: "Стандартная",
    description: "Чистый современный дизайн со скруглёнными элементами и мягкими тенями",
    preview: (
      <div className="space-y-3 p-4">
        <div className="h-3 w-3/4 rounded-full bg-primary/20" />
        <div className="h-8 rounded-xl border bg-white shadow-sm" />
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full bg-primary/80" />
          <div className="h-6 w-16 rounded-full border" />
        </div>
        <div className="h-16 rounded-xl border bg-white shadow-sm" />
      </div>
    ),
  },
  {
    id: "neobrutalism",
    name: "Необрутализм",
    description: "Жирные рамки, чёткие тени и контрастные формы в стиле нео-брутализма",
    preview: (
      <div className="space-y-3 p-4">
        <div className="h-3 w-3/4 rounded bg-primary/20" />
        <div className="h-8 rounded border-2 border-slate-800 bg-white shadow-[3px_3px_0_0_rgba(0,0,0,0.8)]" />
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded border-2 border-slate-800 bg-primary/80 shadow-[2px_2px_0_0_rgba(0,0,0,0.8)]" />
          <div className="h-6 w-16 rounded border-2 border-slate-800" />
        </div>
        <div className="h-16 rounded border-2 border-slate-800 bg-white shadow-[3px_3px_0_0_rgba(0,0,0,0.8)]" />
      </div>
    ),
  },
]

export function ThemeSettingsForm({ currentTheme }: Props) {
  const [selected, setSelected] = useState<ThemeName>(currentTheme)

  const { execute, isPending } = useAction(updateTheme, {
    onSuccess: () => {
      toast.success("Тема обновлена")
      // Force full reload to apply CSS changes
      window.location.reload()
    },
    onError: (e) => {
      toast.error(e.error.serverError || "Ошибка при смене темы")
    },
  })

  const hasChanges = selected !== currentTheme

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold font-heading">Тема оформления</h2>
        <p className="text-sm text-muted-foreground">
          Выберите визуальный стиль для всего сайта
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {themes.map((theme) => (
          <Card
            key={theme.id}
            className={`cursor-pointer transition-all ${
              selected === theme.id
                ? "ring-2 ring-primary ring-offset-2"
                : "hover:shadow-md"
            }`}
            onClick={() => setSelected(theme.id)}
          >
            <CardContent className="p-0">
              {/* Preview area */}
              <div className="rounded-t-lg border-b bg-muted/30">
                {theme.preview}
              </div>

              {/* Info */}
              <div className="flex items-start gap-3 p-4">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  selected === theme.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                }`}>
                  {selected === theme.id && <Check className="h-3 w-3" />}
                </div>
                <div>
                  <p className="font-semibold">{theme.name}</p>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasChanges && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="flex-1 text-sm">
            Тема будет изменена на <strong>{themes.find((t) => t.id === selected)?.name}</strong>.
            Изменения вступят в силу сразу для всех посетителей.
          </p>
          <Button onClick={() => execute({ theme: selected })} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Применить
          </Button>
        </div>
      )}
    </div>
  )
}
