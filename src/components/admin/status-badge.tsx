import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  active: boolean
  activeLabel?: string
  inactiveLabel?: string
}

export function StatusBadge({
  active,
  activeLabel = "Активно",
  inactiveLabel = "Неактивно",
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        active
          ? "bg-success/10 text-success"
          : "bg-muted text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "mr-1.5 h-1.5 w-1.5 rounded-full",
          active ? "bg-success" : "bg-muted-foreground"
        )}
      />
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}
