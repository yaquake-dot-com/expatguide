"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AdminSidebar } from "./admin-sidebar"

interface AdminHeaderProps {
  userName: string
  nickname?: string | null
  role: string
  pendingCount?: number
}

const breadcrumbMap: Record<string, string> = {
  admin: "Дашборд",
  countries: "Страны",
  cities: "Города",
  "specialist-categories": "Категории специалистов",
  specialists: "Специалисты",
  "article-categories": "Категории статей",
  articles: "Статьи",
  "link-categories": "Категории ссылок",
  links: "Полезные ссылки",
  ads: "Реклама",
  moderation: "Модерация",
  users: "Пользователи",
  settings: "Настройки",
  new: "Создать",
  edit: "Редактировать",
}

export function AdminHeader({ userName, nickname, role, pendingCount }: AdminHeaderProps) {
  const pathname = usePathname()

  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const label = breadcrumbMap[segment] || segment
    return { href, label }
  })

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-white px-4 lg:px-6">
      {/* Mobile sidebar trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <AdminSidebar role={role} pendingCount={pendingCount} />
        </SheetContent>
      </Sheet>

      {/* Breadcrumbs */}
      <nav className="hidden items-center gap-1 text-sm text-muted-foreground lg:flex">
        <Link href="/admin" className="hover:text-foreground">
          <Home className="h-4 w-4" />
        </Link>
        {breadcrumbs.slice(1).map((crumb, index) => (
          <span key={crumb.href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            {index === breadcrumbs.length - 2 ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden sm:block">{userName}</span>
        <span className={cn(
          "rounded-full px-2.5 py-0.5 text-xs font-medium",
          role === "SUPER_ADMIN"
            ? "bg-primary/10 text-primary"
            : "bg-warning/10 text-warning"
        )}>
          {nickname ? `@${nickname}` : (role === "SUPER_ADMIN" ? "Суперадмин" : "Админ страны")}
        </span>
      </div>
    </header>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
