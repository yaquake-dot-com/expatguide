import { type LucideIcon, Inbox } from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: LucideIcon
}

export function EmptyState({
  title = "Ничего не найдено",
  description = "Попробуйте изменить параметры поиска",
  icon: Icon = Inbox,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="mb-4 h-12 w-12 text-muted-foreground/40" />
      <h3 className="mb-2 text-lg font-semibold text-muted-foreground">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground/80">{description}</p>
    </div>
  )
}
