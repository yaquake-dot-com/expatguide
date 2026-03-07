"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Globe,
  Building2,
  Users,
  FolderOpen,
  FileText,
  Link2,
  Megaphone,
  ShieldCheck,
  Settings,
  Tags,
  BookOpen,
  Bookmark,
  LogOut,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface AdminSidebarProps {
  role: string
  pendingCount?: number
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  superOnly?: boolean
  badge?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: "Основное",
    items: [
      { label: "Дашборд", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "География",
    items: [
      { label: "Страны", href: "/admin/countries", icon: Globe, superOnly: true },
      { label: "Города", href: "/admin/cities", icon: Building2 },
    ],
  },
  {
    title: "Справочник",
    items: [
      { label: "Категории", href: "/admin/specialist-categories", icon: Tags },
      { label: "Специалисты", href: "/admin/specialists", icon: Users },
    ],
  },
  {
    title: "Контент",
    items: [
      { label: "Категории статей", href: "/admin/article-categories", icon: FolderOpen },
      { label: "Статьи", href: "/admin/articles", icon: FileText },
      { label: "Категории ссылок", href: "/admin/link-categories", icon: Bookmark },
      { label: "Полезные ссылки", href: "/admin/links", icon: Link2 },
    ],
  },
  {
    title: "Реклама",
    items: [
      { label: "Баннеры", href: "/admin/ads", icon: Megaphone },
    ],
  },
  {
    title: "Управление",
    items: [
      { label: "Модерация", href: "/admin/moderation", icon: ShieldCheck, superOnly: true, badge: true },
      { label: "Пользователи", href: "/admin/users", icon: BookOpen, superOnly: true },
      { label: "Настройки", href: "/admin/settings", icon: Settings, superOnly: true },
    ],
  },
]

export function AdminSidebar({ role, pendingCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname()
  const isSuperAdmin = role === "SUPER_ADMIN"

  return (
    <div className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-14 items-center px-4">
        <Link href="/admin" className="text-lg font-bold font-heading text-sidebar-primary">
          ExpatGuide
        </Link>
      </div>
      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navSections.map((section) => {
            const visibleItems = section.items.filter(
              (item) => !item.superOnly || isSuperAdmin
            )
            if (visibleItems.length === 0) return null

            return (
              <div key={section.title}>
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && pendingCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1.5 text-xs font-bold text-sidebar-primary-foreground">
                            {pendingCount}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Logout */}
      <Separator className="bg-sidebar-border" />
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </Button>
      </div>
    </div>
  )
}
